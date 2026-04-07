const PORT = process.env.PORT || 3000
const express = require("express")
const fs = require("fs")
const app = express()
app.use(express.json())

const readData = () => {
  const data = fs.readFileSync("students.json")
  return JSON.parse(data)
}

const writeData  = (data) => {
  fs.writeFileSync("students.json", JSON.stringify(data, null, 2))
}

// Routes API
// Afficher etudiants 
app.get("/students", (req, res) => {
  const data = readData()
  res.json(data.students)
  console.log("Log: recup des etudiants")
})

// Ajouter un etudiant
app.post("/students", (req, res) => {
  const data = readData()

  const newStudent = {
    id: Date.now(),
    name: req.body.name,
    notes: []
  }

  data.students.push(newStudent)
  writeData(data)

  res.json(newStudent)
  console.log("Log: ajout d'un nouvel etudiant")
})

// Supprimer un etudiant
app.delete("/students/:id", (req, res) => {
  const data = readData()
  const studentId = parseInt(req.params.id)
  data.students = data.students.filter(student => student.id !== studentId)
  writeData(data)
  console.log("Log: suppression d'un etudiant")
})

// Ajouter une note
app.post("/students/:id/notes", (req, res) => {
  const data = readData()
  const studentId = parseInt(req.params.id)
  const student = data.students.find(student => student.id === studentId)

  if (!student) {
    return res.status(404).json({ error: "Étudiant non trouvé" })
  }

  student.notes.push(req.body.note)
  writeData(data)

  res.json(student)
})

// Supprimer une note
app.delete("/students/:id/notes/:noteIndex", (req, res) => {
  const data = readData()
  const studentId = parseInt(req.params.id)
  const noteIndex = parseInt(req.params.noteIndex)
  const student = data.students.find(student => student.id === studentId)

  if (!student) {
    return res.status(404).json({ error: "Étudiant non trouvé" })
  }

  if (noteIndex < 0 || noteIndex >= student.notes.length) {
    return res.status(404).json({ error: "Note non trouvée" })
  }

  student.notes.splice(noteIndex, 1)
  writeData(data)

  res.json(student)
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
app.use(express.static(__dirname))