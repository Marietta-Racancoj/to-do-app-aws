import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Trash2 } from 'lucide-react'; //For trash can icon image used for the delete button
import { Pencil } from 'lucide-react';


const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }




  async function updateTodo(id: string) {
    const newContent = window.prompt("New content?");
    if (!newContent) return;
  
    const { data: updatedTodo, errors } = await client.models.Todo.update({
      id,
      content: newContent,
    });
  
    if (errors) {
      console.error(errors);
    } else {
      console.log("Updated!", updatedTodo);
    }
  }
  
  





  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
 

      <ul>
        {todos.map((todo) => (
          <li 
            key={todo.id} 
            style={{ 
              marginBottom: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}
          >
           {todo.content}
            <div>
              <button onClick={() => updateTodo(todo.id)}style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: '8px',
                }}
                aria-label="Edit todo"
                title="Edit"
              >
              <Pencil size={16} color="blue" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this todo?")) {
                    deleteTodo(todo.id);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Delete todo"
                title="Delete"
              >
                <Trash2 size={16} color="red" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div>
        
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
         
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;




