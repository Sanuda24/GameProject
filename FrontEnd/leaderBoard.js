document.addEventListener("DOMContentLoaded", () => {
    async function fetchLeaderboard() {
        try {
            const response = await fetch("http://localhost:3000/leaderboard");
            if (!response.ok) throw new Error("Failed to fetch leaderboard");

            const data = await response.json();
            const tableBody = document.getElementById("leaderboard-table");

            tableBody.innerHTML = ""; // Clear existing data

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
        } catch (error) {
            console.error("❌ Error fetching leaderboard:", error);
        }
    }

    // 🔹 Fetch leaderboard initially and every 10 seconds
    fetchLeaderboard();
    setInterval(fetchLeaderboard, 10000); // Refresh leaderboard every 10 seconds

    // 🔹 Restart game button
    document.getElementById("restart-button").addEventListener("click", () => {
        window.location.href = "Maze.html";
    });

    // 🔹 Logout button
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("token"); // Remove JWT token
        window.location.href = "login.html";
    });
});