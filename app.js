let countStudents;
const countBadge = document.getElementById("countBadge")
const form = document.getElementById("studentForm")
const emptySchool = document.getElementById("emptyState")

const moyenne = (notes) => {
    if(notes.length === 0) return "N/A"

    const somme = notes.reduce((total, note) => total + note, 0) / notes.length
    return somme
}

displayStudents = async () => {
    const tableBody = document.getElementById("studentTableBody")
    tableBody.innerHTML = ""
    const response = await fetch("/students")
    const students = await response.json()
    countStudents = students.length
    countBadge.innerText = countStudents

    // Trier les etudiants selon leur ordre de merite
    students.sort((a, b) => moyenne(b.notes) - moyenne(a.notes))

    if(students.length == 0) {
        emptySchool.classList.remove("hidden")
    } else {
        emptySchool.classList.add("hidden")
    }

    students.forEach(student => {
        const tableItem = document.createElement("tr")

        tableItem.innerHTML = `
            <td class="px-5 text-slate-600 italic">${student.id}</td>
            <td class="px-5">${student.name}</td>
            <td class="px-5 grid grid-cols-2 gap-2 ">
                ${
                    student.notes.length > 0 
                    ?
                        student.notes.map(note => 
                            `<div class="inline-block flex justify-between items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                ${note}
                                <button class="hover:opacity-50" onclick="confirm('Voulez-vous vraiment supprimer cette note ?') && deleteNote(${student.id}, ${student.notes.indexOf(note)})" title="Supprimer cette note">❌</button>
                            </div>`
                        ).join("")
                    :
                    "N/A"
                }
            </td>
            <td class="px-5">${student.notes.length > 0 ? moyenne(student.notes).toFixed(2) : "N/A"}</td>
            <td class="flex items-center justify-end gap-3 p-3">
                <button class="text-black bg-green-300 rounded-md px-2 py-1 hover:bg-green-400" onclick="addNote(${student.id})">Ajouter Note</button>
                <button class="text-black bg-red-300 rounded-md px-2 py-1 hover:bg-red-400" onclick="if (confirm('Voulez-vous vraiment supprimer cet étudiant ?')) { deleteStudent(${student.id}) }">Supprimer</button>
            </td>
        `

        tableBody.appendChild(tableItem)
    })
}

const addStudent = async () => {
    let prename = document.getElementById("prename").value
    let name = document.getElementById("name").value
    const fullName = prename + " " + name

    await fetch("/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName })
    })

    form.reset()

    displayStudents()
}

const deleteStudent = async (id) => {
    await fetch(`/students/${id}`, {
        method: "DELETE"
    })
    displayStudents()
}

form.addEventListener("submit", (e) => {
    e.preventDefault()
    addStudent()
})

const addNote = async (id) => {
    const response = await fetch("/students")
    const students = await response.json()
    const student = students.find(s => s.id === id)
    let addedNote = prompt(`Entrez la note à ajouter pour ${student.name} :`)
    if(addedNote === null || addedNote === "") {
        return;
    }

    await fetch(`/students/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: Number(addedNote) })
    })

    displayStudents()
}

const deleteNote = async (id, noteIndex) => {
    await fetch(`/students/${id}/notes/${noteIndex}`, {
        method: "DELETE"
    })

    displayStudents()
}

displayStudents()