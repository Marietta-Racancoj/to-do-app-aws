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

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);


  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  async function submitModal() {
    if (!modalContent.trim()) return;
  
    if (modalMode === "create") {
      const { errors } = await client.models.Todo.create({
        content: modalContent.trim(),
      });
  
      if (errors) console.error(errors);
    } else if (modalMode === "edit" && editingTodoId) {
      const { errors } = await client.models.Todo.update({
        id: editingTodoId,
        content: modalContent.trim(),
      });
  
      if (errors) console.error(errors);
    }
  
    // Reset modal state
        setShowModal(false);
        setModalContent("");
        setEditingTodoId(null);
      }
      
      function openCreateModal() {
        setModalMode("create");
        setModalContent("");
        setEditingTodoId(null);
        setShowModal(true);
      }
      
      function openEditModal(todo: { id: string; content?: string | null }) {
        setModalMode("edit");
        setModalContent(todo.content ?? ""); // use empty string if null/undefined
        setEditingTodoId(todo.id);
        setShowModal(true);
      }
      function deleteTodo(id: string) {
        client.models.Todo.delete({ id }).catch(console.error);
      }
      
      
  
  
  
        return (
          <main>
            <h1>{user?.signInDetails?.loginId}'s todos</h1>
            <button onClick={openCreateModal}>+ new</button>

      

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
                <span style={{ paddingRight: '10px' }}>{todo.content}</span>

                  <div>
                  <button
                    onClick={() => openEditModal(todo)}
                    style={{
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

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
          }}>
            <h3>{modalMode === "edit" ? "Edit Todo" : "New Todo"}</h3>
            <textarea
              rows={4}
              style={{ width: '100%', marginBottom: '10px' }}
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={submitModal}>
                {modalMode === "edit" ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
    )}


    </main>
  );
}

export default App;






// import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
// import { useAuthenticator } from '@aws-amplify/ui-react';
// import { Trash2 } from 'lucide-react'; //For trash can icon image used for the delete button
// import { Pencil } from 'lucide-react';


// const client = generateClient<Schema>();

// function App() {
//   const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
//   const { user, signOut } = useAuthenticator();

//   useEffect(() => {
//     client.models.Todo.observeQuery().subscribe({
//       next: (data) => setTodos([...data.items]),
//     });
//   }, []);

//   function createTodo() {
//     client.models.Todo.create({ content: window.prompt("Todo content") });
//   }
//   function deleteTodo(id: string) {
//     client.models.Todo.delete({ id })
//   }


//   async function updateTodo(id: string) {
//     const newContent = window.prompt("New content?");
//     if (!newContent) return;
  
//     const { data: updatedTodo, errors } = await client.models.Todo.update({
//       id,
//       content: newContent,
//     });
  
//     if (errors) {
//       console.error(errors);
//     } else {
//       console.log("Updated!", updatedTodo);
//     }
//   }
  
//   return (
//     <main>
//       <h1>{user?.signInDetails?.loginId}'s todos</h1>
//       <button onClick={createTodo}>+ new</button>
 

//       <ul>
//         {todos.map((todo) => (
//           <li 
//             key={todo.id} 
//             style={{ 
//               marginBottom: '8px', 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'space-between' 
//             }}
//           >
//            {todo.content}
//             <div>
//               <button onClick={() => updateTodo(todo.id)}style={{
//                 background: 'none',
//                 border: 'none',
//                 cursor: 'pointer',
//                 marginRight: '8px',
//                 }}
//                 aria-label="Edit todo"
//                 title="Edit"
//               >
//               <Pencil size={16} color="blue" />
//               </button>
//               <button
//                 onClick={() => {
//                   if (window.confirm("Are you sure you want to delete this todo?")) {
//                     deleteTodo(todo.id);
//                   }
//                 }}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   cursor: 'pointer',
//                 }}
//                 aria-label="Delete todo"
//                 title="Delete"
//               >
//                 <Trash2 size={16} color="red" />
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul>

//       <div>
        
//         <br />
//         <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
         
//         </a>
//       </div>
//       <button onClick={signOut}>Sign out</button>
//     </main>
//   );
// }

// export default App;



