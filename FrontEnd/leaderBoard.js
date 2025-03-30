document.addEventListener("DOMContentLoaded", () => {
    async function fetchLeaderboard(filter = "all") {
        try {
            let url = "http://localhost:3000/leaderboard";
            if (filter !== "all") {
                url += `?difficulty=${filter}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch leaderboard");

            const data = await response.json();
            updateLeaderboard(data);
        } catch (error) {
            console.error("❌ Error fetching leaderboard:", error);
        }
    }

    function updateLeaderboard(data) {
        const tableBody = document.getElementById("leaderboard-table");
        tableBody.innerHTML = ""; // Clear existing data

        data.forEach((entry, index) => {
            let difficultyLabel;
            switch (entry.difficulty) {
                case 8:
                    difficultyLabel = "Easy";
                    break;
                case 10:
                    difficultyLabel = "Medium";
                    break;
                case 12:
                    difficultyLabel = "Hard";
                    break;
                default:
                    difficultyLabel = "Unknown";
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.nickname}</td>
                <td>${entry.time}s</td>
                <td>${difficultyLabel}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 🔹 Fetch leaderboard initially
    fetchLeaderboard();

    // 🔹 Dropdown filter event
    document.getElementById("difficulty-filter").addEventListener("change", async (event) => {
        const selectedDifficulty = event.target.value;
        fetchLeaderboard(selectedDifficulty);
    });

    // 🔹 Restart game button
    document.getElementById("restart-button").addEventListener("click", () => {
        window.location.href = "Maze.html";
    });

    // 🔹 Logout button
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });
});
