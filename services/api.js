const axios = require('axios')

const token = process.env.API_TOKEN

axios.defaults.headers.authorization = 'Bearer ' + token
axios.defaults.baseURL = 'https://online-academy-api-v1.herokuapp.com'

const getCategory = async () => {
  const { data } = await axios.get('/api/category')
  return data
}

const getCourseByCategoryId = async (cateId) => {
  const { data } = await axios.get(`/api/course?categoryId=${cateId}`)
  return data
}

const searchCourse = async (kw) => {
  const { data } = await axios.get(`/api/course/search?kw=${kw}`)
  return data
}

module.exports = {
  getCategory,
  searchCourse,
  getCourseByCategoryId
}
