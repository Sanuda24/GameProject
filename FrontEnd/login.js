document.addEventListener("DOMContentLoaded", () => {
    const loginToggle = document.getElementById("toggle-login");
    const signupToggle = document.getElementById("toggle-signup");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (loginToggle && signupToggle) {
        loginToggle.addEventListener("click", () => {
            loginForm.style.display = "block";
            signupForm.style.display = "none";
            loginToggle.classList.add("active");
            signupToggle.classList.remove("active");
        });

        signupToggle.addEventListener("click", () => {
            signupForm.style.display = "block";
            loginForm.style.display = "none";
            signupToggle.classList.add("active");
            loginToggle.classList.remove("active");
        });
    }

    // 🔹 Handle Login
    document.getElementById("login-button").addEventListener("click", async () => {
        const nickname = document.getElementById("login-nickname").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token); // Store JWT
                alert("Login successful!");
                window.location.href = "Maze.html";
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed. Please try again.");
        }
    });

    // 🔹 Handle Signup
    document.getElementById("signup-button").addEventListener("click", async () => {
        const nickname = document.getElementById("signup-nickname").value;
        const password = document.getElementById("signup-password").value;

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Signup successful! Please log in.");
            loginToggle.click();
        } else {
            alert(data.error);
        }
    });

    // 🔹 Handle Guest Mode
    document.getElementById("guest-button").addEventListener("click", async () => {
        await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
        window.location.href = "Maze.html"; 
    });
});
