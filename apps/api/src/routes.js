const express = require("express")
const router = express.Router()
const db = require("./db")
const { extractSkills } = require("./skillEngine")

// Crear actividad
router.post("/activities", (req, res) => {
  const activity = {
    id: Date.now(),
    userId: req.body.userId || 1,
    type: req.body.type,
    source: req.body.source,
    title: req.body.title,
    url: req.body.url,
    createdAt: new Date()
  }

  db.activities.push(activity)

  // Procesar skills
  const skills = extractSkills(activity)

  skills.forEach(skill => {
    db.userSkills.push({
      userId: activity.userId,
      skill,
      activityId: activity.id
    })
  })

  res.json({ success: true, activity, skills })
})

// Obtener perfil
router.get("/profile/:userId", (req, res) => {
  const userId = Number(req.params.userId)

  const activities = db.activities.filter(a => a.userId === userId)
  const skills = db.userSkills
    .filter(s => s.userId === userId)
    .map(s => s.skill)

  // quitar duplicados
  const uniqueSkills = [...new Set(skills)]

  res.json({
    userId,
    skills: uniqueSkills,
    activities
  })
})

module.exports = router