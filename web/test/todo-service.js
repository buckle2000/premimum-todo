import assert from 'assert'
import { TodoService } from '../lib/todo-service'
import parallel from 'mocha.parallel'

function createService() {
  return new TodoService('localhost', 80)
}

parallel('TodoService', function() {
  it('init without error', async function() {
    const s = await createService()
    s.close()
  })
  it('#add', async function() {
    const s = await createService()
    const id = await s.add('foo')
    const todos = await s.ls()
    assert.equal(todos.length, 1)
    assert.equal(id, todos[0].id)
    s.close()
  })
  it('#rm', async function() {
    const s = await createService()
    const id = await s.add('foo')
    assert.equal((await s.ls()).length, 1)
    assert.equal(await s.rm(id), id)
    assert.equal((await s.ls()).length, 0)
    s.close()
  })
  it('#save and load', async function() {
    let id
    {
      const s = await createService()
      id = await s.add('Hi everyone!')
      await s.save('a')
      s.close()
    }
    {
      const s = await createService()
      await s.load('a')
      const todos = await s.ls()
      assert.equal(id, todos[0].id)      
      s.close()
    }
  })
})
