import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function checkModels() {
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.5-flash-preview-04-17',
    'gemini-2.5-pro-preview-05-06',
  ]

  console.log('🔍 Testing available Gemini models...\n')

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent('Say OK')
      const text = result.response.text()
      console.log(`✅ ${modelName} — WORKS — Response: ${text.slice(0, 30)}`)
    } catch (error) {
      const msg = String(error?.message || error)
      if (msg.includes('quota') || msg.includes('429')) {
        console.log(`⚠️  ${modelName} — QUOTA EXHAUSTED`)
      } else if (msg.includes('404') || msg.includes('not found')) {
        console.log(`❌ ${modelName} — NOT AVAILABLE`)
      } else {
        console.log(`❌ ${modelName} — ERROR: ${msg.slice(0, 80)}`)
      }
    }
    await new Promise(r => setTimeout(r, 1000))
  }
}

checkModels()