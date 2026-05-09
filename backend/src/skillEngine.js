/**
 * Extrae skills de una actividad genérica
 * @param {Object} activity - Actividad del usuario
 * @returns {Array<string>} Lista de skills detectados
 */
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

/**
 * Extrae skills de data de GitHub
 * @param {Array<string>} languages - Lenguajes de programación
 * @param {Array<string>} topics - Topics de repositorios
 * @param {Array<Object>} repositories - Lista de repositorios
 * @returns {Array<string>} Lista de skills detectados
 */
function extractSkillsFromGitHub(languages = [], topics = [], repositories = []) {
  const skillsSet = new Set();

  // Mapeo de lenguajes a skills
  const languageSkillMap = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'csharp': 'C#',
    'cpp': 'C++',
    'c': 'C',
    'go': 'Go',
    'rust': 'Rust',
    'ruby': 'Ruby',
    'php': 'PHP',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'sql': 'SQL',
    'r': 'R',
    'solidity': 'Blockchain',
    'vyper': 'Blockchain'
  };

  // Detectar skills por lenguajes
  languages.forEach(lang => {
    const lowerLang = lang.toLowerCase();
    const skill = languageSkillMap[lowerLang] || lang;
    skillsSet.add(skill);
  });

  // Detectar skills por topics
  const topicSkillMap = {
    'machine-learning': 'Machine Learning',
    'ml': 'Machine Learning',
    'ai': 'AI',
    'artificial-intelligence': 'AI',
    'web3': 'Web3',
    'blockchain': 'Blockchain',
    'crypto': 'Cryptocurrency',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'nodejs': 'Node.js',
    'express': 'Express',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS',
    'gcp': 'GCP',
    'azure': 'Azure',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'redis': 'Redis',
    'api': 'API Development',
    'rest': 'REST APIs',
    'graphql': 'GraphQL'
  };

  topics.forEach(topic => {
    const lowerTopic = topic.toLowerCase().replace(/ /g, '-');
    if (topicSkillMap[lowerTopic]) {
      skillsSet.add(topicSkillMap[lowerTopic]);
    }
  });

  // Detectar skills por descripción de repositorios y estrellas
  repositories.forEach(repo => {
    if (repo.description) {
      const desc = repo.description.toLowerCase();
      
      if (desc.includes('machine learning') || desc.includes('neural network')) {
        skillsSet.add('Machine Learning');
      }
      if (desc.includes('web3') || desc.includes('blockchain')) {
        skillsSet.add('Blockchain');
      }
      if (desc.includes('api')) {
        skillsSet.add('API Development');
      }
      if (desc.includes('database') || desc.includes('db')) {
        skillsSet.add('Database Design');
      }
    }

    // Repositorios con muchas estrellas indican expertise
    if (repo.stargazers_count >= 100) {
      skillsSet.add('Open Source Contributor');
    }
  });

  return Array.from(skillsSet);
}

module.exports = { extractSkills, extractSkillsFromGitHub }