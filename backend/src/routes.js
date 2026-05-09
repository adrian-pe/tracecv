const express = require("express")
const router = express.Router()
const db = require("./db")
const { extractSkills, extractSkillsFromGitHub } = require("./skillEngine")
const { enrichGitHubData } = require("./githubService")

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

// Nuevo endpoint: Integrar GitHub
router.post("/github/:username", async (req, res) => {
  try {
    const { username } = req.params
    const userId = req.body.userId || 1

    // Obtener datos de GitHub
    const gitHubData = await enrichGitHubData(username, userId)

    // Extraer skills de los datos de GitHub
    const skillsFromGitHub = extractSkillsFromGitHub(
      gitHubData.languages,
      gitHubData.topics,
      gitHubData.repositories
    )

    // Crear una actividad por cada repositorio importante
    const reposToStore = gitHubData.repositories.slice(0, 20) // Limitamos a los últimos 20

    reposToStore.forEach(repo => {
      const repoActivity = {
        id: `github-${repo.id}`,
        userId,
        type: "repository",
        source: "github",
        title: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at)
      }

      // Evitar duplicados
      const exists = db.activities.find(a => a.id === repoActivity.id)
      if (!exists) {
        db.activities.push(repoActivity)
      }
    })

    // Guardar todos los skills extraídos
    skillsFromGitHub.forEach(skill => {
      // Evitar duplicados por usuario y skill
      const exists = db.userSkills.find(s => s.userId === userId && s.skill === skill)
      if (!exists) {
        db.userSkills.push({
          userId,
          skill,
          source: "github"
        })
      }
    })

    res.json({
      success: true,
      message: `GitHub profile for "${username}" processed successfully`,
      user: {
        username: gitHubData.username,
        profile: {
          name: gitHubData.profile.name,
          bio: gitHubData.profile.bio,
          location: gitHubData.profile.location,
          public_repos: gitHubData.profile.public_repos,
          followers: gitHubData.profile.followers,
          following: gitHubData.profile.following,
          created_at: gitHubData.profile.created_at,
          avatar_url: gitHubData.profile.avatar_url
        }
      },
      skillsDetected: skillsFromGitHub,
      repositoriesProcessed: reposToStore.length,
      totalRepositories: gitHubData.repositories.length,
      languages: gitHubData.languages,
      topics: gitHubData.topics
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router