const axios = require('axios');

const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Cliente HTTP configurado con autenticación
const githubClient = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  headers: GITHUB_TOKEN ? {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  } : {
    'Accept': 'application/vnd.github.v3+json'
  }
});

/**
 * Obtiene información del perfil de usuario en GitHub
 * @param {string} username - Usuario de GitHub
 * @returns {Promise<Object>} Datos del perfil
 */
async function fetchUserProfile(username) {
  try {
    const response = await githubClient.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`GitHub user "${username}" not found`);
    }
    throw new Error(`GitHub API error: ${error.message}`);
  }
}

/**
 * Obtiene repositorios públicos del usuario
 * @param {string} username - Usuario de GitHub
 * @returns {Promise<Array>} Lista de repositorios
 */
async function fetchUserRepositories(username) {
  try {
    const response = await githubClient.get(`/users/${username}/repos`, {
      params: {
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
}

/**
 * Procesa los datos de GitHub para generar actividades y extraer lenguajes
 * @param {string} username - Usuario de GitHub
 * @param {number} userId - ID del usuario en TraceCV
 * @returns {Promise<Object>} Objeto con repositories y languages
 */
async function enrichGitHubData(username, userId) {
  try {
    const [profile, repositories] = await Promise.all([
      fetchUserProfile(username),
      fetchUserRepositories(username)
    ]);

    // Extraer lenguajes únicos de los repositorios
    const languages = new Set();
    const topics = new Set();
    
    repositories.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(topic => topics.add(topic));
      }
    });

    return {
      profile,
      repositories,
      languages: Array.from(languages),
      topics: Array.from(topics),
      username,
      userId
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  fetchUserProfile,
  fetchUserRepositories,
  enrichGitHubData
};
