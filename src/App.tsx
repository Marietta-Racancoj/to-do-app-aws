import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  Button,
  IconButton,
  TextField,
  Typography,
  Stack,
  Container,
  Paper
} from "@mui/material";
import { Trash2, Pencil } from "lucide-react";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const createTodo = async () => {
    if (!newContent.trim()) return;
    await client.models.Todo.create({ content: newContent });
    setNewContent("");
  };

  const deleteTodo = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      await client.models.Todo.delete({ id });
    }
  };

  const updateTodo = async (id: string) => {
    if (!editingContent.trim()) return;
    await client.models.Todo.update({ id, content: editingContent });
    setEditingId(null);
    setEditingContent("");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {user?.signInDetails?.loginId}'s Todos
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          label="New todo"
          fullWidth
          size="small"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <Button onClick={createTodo} variant="contained">
          + Add
        </Button>
      </Stack>

      <Stack spacing={2}>
        {todos.map((todo) => (
          <Paper key={todo.id} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {editingId === todo.id ? (
                <>
                  <TextField
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Button onClick={() => updateTodo(todo.id)} variant="outlined">
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Typography>{todo.content}</Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditingContent(todo.content);
                      }}
                    >
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton onClick={() => deleteTodo(todo.id)}>
                      <Trash2 size={18} color="red" />
                    </IconButton>
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Button onClick={signOut} sx={{ mt: 4 }}>
        Sign Out
      </Button>
    </Container>
  );
}

export default App;


// import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
// import { useAuthenticator } from '@aws-amplify/ui-react';
// import { Trash2 } from 'lucide-react'; //For trash can icon image used for the delete button

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
//             {todo.content}
//             <button 
//               onClick={() => {
//                 if (window.confirm("Are you sure you want to delete this todo?")) {
//                   deleteTodo(todo.id);
//                 }
//               }} 
//               style={{ 
//                 background: 'none', 
//                 border: 'none', 
//                 cursor: 'pointer' 
//               }}
//               aria-label="Delete todo"
//               title="Delete"
//             >
//               <Trash2 size={16} color="red" />
//             </button>
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
