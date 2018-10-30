import net from 'net'
import tls from 'tls'
import { promisify } from 'util'
import Expect from 'stream-expect'

export const PROMPT = '\n> '
export const PROMPT_REGEX = /.*> /

export class TodoServiceError extends Error { }

/**
 @typedef Todo
 @type {Object}
 @property {string} id
 @property {string} text
 */

export class TodoService {
    constructor(host, port) {
        // const socket = this._socket = tls.connect({ port, host, encoding: 'utf-8', rejectUnauthorized: false })
        const socket = this._socket = net.createConnection({ port, host, encoding: 'utf-8' })
        // TODO: enable TLS

        return new Promise((res, rej) => {
            socket.on('error', err => {
                this._socket.end()
                rej(err)
            })
            socket.on('connect', () => {
                const exp = this._exp = Expect.createExpect(socket, socket)
                exp.expect_async = promisify((...args) => exp.expect(...args))
                this._next()
                    .then(() => this.checkVersion('1'))
                    .then(() => res(this))
                    .catch(rej)
            })
        }) 
    }

    async _next() {
        let result = await this._exp.expect_async(PROMPT_REGEX)
        if (result.indexOf('Error: ') === 0) {
            throw new TodoServiceError('Client error. Result:\n' + result)
        }
        return result
    }

    /**
     * Get result of command without the trailing newline
     */
    async _nextWithoutNewline() {
        let result = await this._next()
        const expectedPromptPosition = result.length - PROMPT.length
        if (result.indexOf(PROMPT) !== expectedPromptPosition) {
            throw new TodoServiceError('No new line? Result:\n' + result)
        }
        return result.substring(0, expectedPromptPosition)
    }

    async checkVersion(expectedVersion) {
        this._exp.send('version\n')
        const version = await this._nextWithoutNewline()
        if (version !== expectedVersion) {
            throw new TodoServiceError('Wrong service version: ' + version)
        }
    }

    /**
     * Add a item
     * @returns {string} id of added item
     */
    async add(text) {
        this._exp.send(`add ${text}\n`)
        return await this._nextWithoutNewline()
    }

    /**
     * Remove a item
     * @returns {string} id of removed item
     */
    async rm(id) {
        this._exp.send(`rm ${id}\n`)
        return await this._nextWithoutNewline()
    }

    /**
     * Save list to file
     */
    async save(filename) {
        this._exp.send(`save ${filename}\n`)
        await this._next()
    }

    /**
     * Load list to file
     */
    async load(filename) {
        this._exp.send(`load ${filename}\n`)
        await this._next()
    }    

    /**
     * List all items
     * 
     * @returns {Array.<Todo>} array of Todo
     */
    async ls() {
        this._exp.send('ls\n')
        const result = await this._nextWithoutNewline()
        if (result === '') return []
        return result
            // raw
            .split('\n')
            // array of raw lines
            .map(row => row.split('\t'))
            // array of array
            .map(row => { return { id: row[0], text: row[1] } })
        // array of object
    }

    close() {
        this._socket.end()
    }
}
