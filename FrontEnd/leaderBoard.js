document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/leaderboard")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("leaderboard-table");
            tableBody.innerHTML = ""; // Clear existing content

            data.forEach((entry, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.nickname}</td>
                    <td>${entry.time}s</td>
                    <td>${entry.difficulty}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching leaderboard:", error));

    // Restart game
    document.getElementById("restart-button").addEventListener("click", () => {
        window.location.href = "Maze.html";
    });

    // Logout
    document.getElementById("logout-button").addEventListener("click", () => {
        sessionStorage.removeItem("nickname");
        window.location.href = "login.html";
    });
});