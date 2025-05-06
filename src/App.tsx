import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Trash2, Pencil } from "lucide-react";
import { uploadData, getUrl } from 'aws-amplify/storage';


const client = generateClient<Schema>();


function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: async (data) => {
        setTodos([...data.items]);

        // Load URLs for any todos with photo keys
        const photoMap: Record<string, string> = {};
        for (const todo of data.items) {
          if (todo.photoKey) {
            const { url } = await getUrl({ key: todo.photoKey });
            photoMap[todo.id] = url.toString(); // 

          }
        }
        setPhotoUrls(photoMap);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  async function submitModal() {
    if (!modalContent.trim()) return;

    let uploadedKey: string | undefined;

    if (photoFile) {
      const filename = `protected/${Date.now()}-${photoFile.name}`;
      const result = await uploadData({
        key: filename,
        data: photoFile,
        options: { contentType: photoFile.type },
      }).result;
      if (result?.key) uploadedKey = result.key;
    }

    if (modalMode === "create") {
      const { errors } = await client.models.Todo.create({
        content: modalContent.trim(),
        photoKey: uploadedKey,

      });
      if (errors) console.error(errors);
    } else if (modalMode === "edit" && editingTodoId) {
      const { errors } = await client.models.Todo.update({
        id: editingTodoId,
        content: modalContent.trim(),
        ...(uploadedKey && { photoKey2: uploadedKey }),
      });
      if (errors) console.error(errors);
    }

    setShowModal(false);
    setModalContent("");
    setEditingTodoId(null);
    setPhotoFile(null);
  }

  function openCreateModal() {
    setModalMode("create");
    setModalContent("");
    setEditingTodoId(null);
    setPhotoFile(null);
    setShowModal(true);
  }

  function openEditModal(todo: { id: string; content?: string | null }) {
    setModalMode("edit");
    setModalContent(todo.content ?? "");
    setEditingTodoId(todo.id);
    setPhotoFile(null);
    setShowModal(true);
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id }).catch(console.error);
  }

  return (
    <main>
      <h1 className="user-name">{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={openCreateModal}>+ new</button>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ paddingRight: "10px" }}>{todo.content}</span>

            {photoUrls[todo.id] && (
              <img
                src={photoUrls[todo.id]}
                alt="Todo"
                style={{ width: "60px", height: "auto", marginRight: "10px" }}
              />
            )}

            <div>
              <button
                onClick={() => openEditModal(todo)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginRight: "8px",
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
                  background: "none",
                  border: "none",
                  cursor: "pointer",
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

      <button onClick={signOut}>Sign out</button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
            }}
          >
            <h3>{modalMode === "edit" ? "Edit Todo" : "New Todo"}</h3>
            <textarea
              rows={4}
              style={{ width: "100%", marginBottom: "10px" }}
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setPhotoFile(e.target.files[0]);
              }}
              style={{ marginBottom: "10px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={submitModal}>{modalMode === "edit" ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
