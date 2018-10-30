#!/usr/bin/env pypy3

import uuid, pickle


class Todo:
    def __init__(self, text):
        self.id = str(uuid.uuid4())[:7]
        self.text = text

    def __str__(self):
        return f'{self.id}\t{self.text}'


def main():
    todos = []

    while True:
        buf = input('> ')
        cmd = buf.strip().split(maxsplit=1)

        if cmd[0] == 'help':
            print('version')
            print('ls')
            print('add <TEXT>')
            print('rm <ID>')
            print('save <FILE>')
            print('load <FILE>')
            continue

        if cmd[0] == 'version':
            print('1')
            continue

        if cmd[0] == 'ls':
            for todo in todos:
                print(todo)
            continue

        if cmd[0] == 'add':
            todo = Todo(cmd[1])
            todos.append(todo)
            print(todo.id)
            continue

        if cmd[0] == 'rm':
            to_remove = None
            for todo in todos:
                if todo.id.startswith(cmd[1]):
                    to_remove = todo
                    break
            if to_remove:
                todos.remove(to_remove)
                print(to_remove.id)
            else:
                print('Error: invalid id')
            continue

        if cmd[0] == 'save':
            with open(cmd[1], 'wb') as f:
                pickle.dump(todos, f)
            continue


        if cmd[0] == 'load':
            with open(cmd[1], 'rb') as f:
                todos = pickle.load(f)
            continue
        

        print('Error: invalid command; enter `help` for help.')


if __name__ == '__main__':
    try:
        main()
    except EOFError:
        exit()
    except:
        exit(1)
