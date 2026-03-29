// ===============================
// INITIAL DATA
// ===============================

let members = [];
let currentListId = null;

// ===============================
// UTILITY
// ===============================

function normalizeName(name) {
    return name.trim().toLowerCase();
}

function updateTotalCount() {
    const totalElement = document.getElementById("totalMembers");
    if (totalElement) {
        totalElement.textContent = `Total Members: ${members.length}`;
    }
}

// ===============================
// FIREBASE MEMBER FUNCTIONS
// ===============================

async function saveMemberToFirebase(name) {
    if (!window.db) return;

    try {
        await window.addDoc(
            window.collection(window.db, "members"),
            {
                name: name,
                createdAt: new Date()
            }
        );
    } catch (error) {
        console.error("Error saving member:", error);
    }
}

async function loadMembersFromFirebase() {
    if (!window.db) return;

    members = [];

    try {
        const snapshot = await window.getDocs(
            window.collection(window.db, "members")
        );

        snapshot.forEach(docSnap => {
            members.push({
                id: docSnap.id,
                name: docSnap.data().name
            });
        });

        renderMembers();
    } catch (error) {
        console.error("Error loading members:", error);
    }
}

async function deleteMemberFromFirebase(id) {
    if (!window.db) return;

    try {
        await window.deleteDoc(
            window.doc(window.db, "members", id)
        );
    } catch (error) {
        console.error("Delete error:", error);
    }
}

// ===============================
// MEMBER MANAGEMENT
// ===============================

async function addMember() {

    const textarea = document.getElementById("memberName");
    const names = textarea.value.split("\n");

    for (let name of names) {

        const cleanName = name.trim();
        if (!cleanName) continue;

        const exists = members.some(
            m => normalizeName(m.name) === normalizeName(cleanName)
        );

        if (!exists) {
            await saveMemberToFirebase(cleanName);
        }
    }

    textarea.value = "";
    await loadMembersFromFirebase();
}

async function deleteMember(index) {

    if (!confirm("Delete this member?")) return;

    const member = members[index];
    await deleteMemberFromFirebase(member.id);
    await loadMembersFromFirebase();
}

// ===============================
// RENDER MEMBERS
// ===============================

function renderMembers() {

    const list = document.getElementById("memberList");
    list.innerHTML = "";

    members.sort((a, b) => a.name.localeCompare(b.name));

    members.forEach((member, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>${member.name}</span>
            <button onclick="deleteMember(${index})">Delete</button>
        `;

        list.appendChild(li);
    });

    updateTotalCount();
}

// ===============================
// SECTION SWITCH
// ===============================

function showSection(id) {

    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    if (id === "listmaker") {
        renderMemberChips();
    }
}

// ===============================
// MEMBER CHIPS
// ===============================

function renderMemberChips() {

    const container = document.getElementById("memberSelection");
    const listInput = document.getElementById("listInput");

    container.innerHTML = "";

    members.sort((a, b) => a.name.localeCompare(b.name));

    const selectedNames = listInput.value
        .split("\n")
        .map(n => normalizeName(n))
        .filter(n => n !== "");

    members.forEach(member => {

        const chip = document.createElement("div");
        chip.classList.add("member-chip");
        chip.textContent = member.name;

        if (selectedNames.includes(normalizeName(member.name))) {
            chip.classList.add("active");
        }

        chip.onclick = function () {

            let current = listInput.value
                .split("\n")
                .map(n => n.trim())
                .filter(n => n !== "");

            const exists = current.some(
                n => normalizeName(n) === normalizeName(member.name)
            );

            if (!exists) {
                listInput.value +=
                    (listInput.value ? "\n" : "") + member.name;
                chip.classList.add("active");
            } else {
                current = current.filter(
                    n => normalizeName(n) !== normalizeName(member.name)
                );
                listInput.value = current.join("\n");
                chip.classList.remove("active");
            }
        };

        container.appendChild(chip);
    });
}

// ===============================
// SEARCH
// ===============================

function filterMembers() {

    const search = document
        .getElementById("memberSearch")
        .value
        .toLowerCase()
        .trim();

    const chips = document.querySelectorAll("#memberSelection .member-chip");

    chips.forEach(chip => {

        const name = chip.textContent.toLowerCase();

        chip.style.display =
            name.includes(search) ? "inline-block" : "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("memberSearch");
    if (searchInput) {
        searchInput.addEventListener("input", filterMembers);
    }
});

// ===============================
// REFRESH
// ===============================

function refreshListMaker() {

    document.getElementById("memberSearch").value = "";
    document.getElementById("listInput").value = "";
    document.getElementById("appName").value = "";

    renderMemberChips();
}

// ===============================
// GENERATE LIST (NO GAP VERSION)
// ===============================

async function generateList() {

    const appName = document.getElementById("appName").value.trim();
    const listInput = document.getElementById("listInput");
    const output = document.getElementById("outputList");

    const names = listInput.value
        .split("\n")
        .map(n => n.trim())
        .filter(n => n !== "");

    output.innerHTML = "";

    if (!appName || names.length === 0) {
        output.innerHTML =
            "<p>Please enter app name and select members.</p>";
        return;
    }

    output.innerHTML += `<h3>${appName}</h3>`;

    names.forEach((name, index) => {
        output.innerHTML += `${index + 1}. ${name}<br>`;
    });

    showSection("generated");

    await autoSaveList(
        `${appName}\n` +
        names.map((n, i) => `${i + 1}. ${n}`).join("\n")
    );
}

// ===============================
// COPY
// ===============================

function copyList() {

    const text = document.getElementById("outputList").innerText;

    if (!text) {
        alert("Nothing to copy!");
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => alert("List copied!"));
}

// ===============================
// FIREBASE LIST SAVE
// ===============================

async function autoSaveList(content) {

    if (!window.db) return;

    try {

        if (currentListId) {

            await window.updateDoc(
                window.doc(window.db, "lists", currentListId),
                {
                    content,
                    updatedAt: new Date()
                }
            );

        } else {

            const docRef = await window.addDoc(
                window.collection(window.db, "lists"),
                {
                    content,
                    createdAt: new Date()
                }
            );

            currentListId = docRef.id;
        }

    } catch (error) {
        console.error("Auto Save Error:", error);
    }
}

// ===============================
// DELETE LIST
// ===============================

async function deleteList() {

    if (!currentListId) {
        alert("No saved list found!");
        return;
    }

    if (!confirm("Delete this list permanently?")) return;

    try {

        await window.deleteDoc(
            window.doc(window.db, "lists", currentListId)
        );

        document.getElementById("outputList").innerHTML = "";
        currentListId = null;

        alert("List deleted successfully!");

    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    setTimeout(() => {
        loadMembersFromFirebase();
    }, 800);

});