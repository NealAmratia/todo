let token = "";

async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    });

    const data = await res.json();
    document.getElementById("auth-message").innerText = data.detail || "Registered!";
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Prepare form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    // Debug log form data
    console.log("Logging in with form data:", formData.toString());

    try {
        const res = await fetch("http://127.0.0.1:8000/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        console.log("Login response status:", res.status);
        const text = await res.text();
        console.log("Login response text:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (jsonErr) {
            console.error("Error parsing JSON response:", jsonErr);
            document.getElementById("auth-message").innerText = "Invalid response from server";
            return;
        }

        if (res.ok && data.access_token) {
            token = data.access_token;
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("tasks-section").style.display = "block";
            fetchTasks();
        } else {
            document.getElementById("auth-message").innerText = (data && data.detail) ? data.detail : "Login failed";
            console.error("Login failed:", data);
        }

    } catch (error) {
        console.error("Login error:", error);
        document.getElementById("auth-message").innerText = "Login failed";
    }
}

// Add update and delete functionality in app.js

async function fetchTasks() {
    const res = await fetch("http://127.0.0.1:8000/tasks", {
        headers: {Authorization: "Bearer " + token}
    });
    const tasks = await res.json();
    const list = document.getElementById("task-list");
    list.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = `${task.title} - ${task.description} [${task.done ? "Done" : "Pending"}]`;

        // Add 'Done/Undone' toggle button
        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = task.done ? "Mark Undone" : "Mark Done";
        toggleBtn.onclick = async () => {
            await fetch(`http://127.0.0.1:8000/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    done: !task.done
                })
            });
            fetchTasks();
        };

        // Add 'Delete' button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = async () => {
            await fetch(`http://127.0.0.1:8000/tasks/${task.id}`, {
                method: "DELETE",
                headers: {Authorization: "Bearer " + token}
            });
            fetchTasks();
        };

        li.appendChild(toggleBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function createTask() {
    const title = document.getElementById("new-task-title").value;
    const description = document.getElementById("new-task-desc").value;

    await fetch("http://127.0.0.1:8000/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({title, description})
    });

    document.getElementById("new-task-title").value = "";
    document.getElementById("new-task-desc").value = "";
    fetchTasks();
}

function logout() {
    token = "";
    document.getElementById("tasks-section").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
}