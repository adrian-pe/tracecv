function extractSkills(activity) {
  const skills = []

  const title = activity.title.toLowerCase()

  if (title.includes("solidity") || title.includes("web3")) {
    skills.push("Blockchain")
  }

  if (title.includes("react")) {
    skills.push("React")
  }

  if (activity.source === "github") {
    skills.push("Programming")
  }

  return skills
}

module.exports = { extractSkills }