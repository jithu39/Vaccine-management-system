import Disease from "../Models/Disease.js";
import Vaccine from "../Models/Vaccine.js";
import catchAsyncErrors from "../Middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Middlewares/error.js";
import { Tool } from "@langchain/core/tools";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { config } from "dotenv";
config({ path: "./config/config.env" });


const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const initializeLLM = () => {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    return null;
  }
  return new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
  });
};

// Tool: Search diseases by city and include vaccines
class DiseaseByCityTool extends Tool {
  name = "disease_by_city";
  description = `
    Search for diseases reported in a specific city or region, along with vaccines available for those diseases.
    Use this tool when:
    - The user asks about diseases in a particular city (e.g., "What diseases are common in Delhi?")
    - The user wants to know vaccines available for those city-specific diseases.
    This tool searches diseases by matching the given city against the "affectedAreas" field in the database
    and then includes vaccines that cover those diseases.
    `;

    
  async _call(input) {
    try {
      const cityName = escapeRegExp(input.toLowerCase());

      // Find diseases in this city
      const diseases = await Disease.find({
        affectedAreas: { $regex: cityName, $options: "i" },
        approved: true,
      });

      if (diseases.length === 0) {
        return `No diseases found in "${input}". Try another city.`;
      }

      // For each disease, also fetch vaccines that cover it
      const results = await Promise.all(
        diseases.map(async (disease) => {
          const vaccines = await Vaccine.find({
            diseasesCovered: disease._id,
            approved: true,
          }).populate("diseasesCovered", "name");

          return {
            name: disease.name,
            description: disease.description,
            affectedAreas: disease.affectedAreas,
            vaccines: vaccines.map((v) => ({
              name: v.name,
              description: v.description,
              recommendedAge: v.recommendedAge,
              dosesRequired: v.dosesRequired,
              sideEffects: v.sideEffects,
              diseasesCovered: v.diseasesCovered.map((d) => d.name),
            })),
          };
        })
      );

      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error searching diseases by city: ${error.message}`;
    }
  }
}

// Tool: Search for diseases
class DiseaseSearchTool extends Tool {
  name = "disease_search";
  description = `
    Search for diseases using multiple criteria such as name, description (symptoms), or affected areas.
    Use this tool when:
    - The user asks about a disease by name (e.g., "Tell me about malaria")
    - The user describes symptoms (e.g., "Which diseases cause fever and cough?")
    - The user wants to know what diseases are found in a location (e.g., "Diseases in coastal regions")
    This tool returns detailed information about matching diseases including description and affected areas.
    `;

  async _call(input) {
    try {
      const searchTerm = escapeRegExp(input.toLowerCase());

      const diseasesByName = await Disease.find({
        name: { $regex: searchTerm, $options: "i" },
        approved: true,
      });

      const diseasesByDesc = await Disease.find({
        description: { $regex: searchTerm, $options: "i" },
        approved: true,
      });

      const diseasesByArea = await Disease.find({
        affectedAreas: { $regex: searchTerm, $options: "i" },
        approved: true,
      });

      const allDiseases = [
        ...diseasesByName,
        ...diseasesByDesc,
        ...diseasesByArea,
      ];
      const uniqueDiseases = allDiseases.filter(
        (disease, index, self) =>
          index ===
          self.findIndex((d) => d._id.toString() === disease._id.toString())
      );

      if (uniqueDiseases.length === 0) {
        return `No diseases found matching "${input}". Try searching with different terms.`;
      }

      const results = uniqueDiseases.map((disease) => ({
        name: disease.name,
        description: disease.description,
        affectedAreas: disease.affectedAreas,
        id: disease._id,
      }));

      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error searching for diseases: ${error.message}`;
    }
  }
}

// Tool: Search for vaccines
class VaccineSearchTool extends Tool {
  name = "vaccine_search";
  description = `
    Search for vaccines based on different criteria such as name, description, recommended age groups,
    or side effects.
    Use this tool when:
    - The user asks about a vaccine by name (e.g., "Tell me about Covaxin")
    - The user wants vaccines for a certain age (e.g., "Which vaccines are for infants?")
    - The user asks about vaccines with specific side effects (e.g., "Which vaccines cause mild fever?")
    - The user wants vaccine info by target disease (indirectly captured via disease name in description)
    This tool returns details about vaccines including name, description, dosage requirements,
    recommended age, side effects, and diseases they protect against.
    `;

  async _call(input) {
    try {
      const searchTerm = escapeRegExp(input.toLowerCase());

      const vaccinesByName = await Vaccine.find({
        name: { $regex: searchTerm, $options: "i" },
        approved: true,
      }).populate("diseasesCovered", "name");

      const vaccinesByDesc = await Vaccine.find({
        description: { $regex: searchTerm, $options: "i" },
        approved: true,
      }).populate("diseasesCovered", "name");

      const vaccinesByAge = await Vaccine.find({
        recommendedAge: { $regex: searchTerm, $options: "i" },
        approved: true,
      }).populate("diseasesCovered", "name");

      const allVaccines = [
        ...vaccinesByName,
        ...vaccinesByDesc,
        ...vaccinesByAge,
      ];
      const uniqueVaccines = allVaccines.filter(
        (vaccine, index, self) =>
          index ===
          self.findIndex((v) => v._id.toString() === vaccine._id.toString())
      );

      if (uniqueVaccines.length === 0) {
        return `No vaccines found matching "${input}". Try searching with different terms.`;
      }

      const results = uniqueVaccines.map((vaccine) => ({
        name: vaccine.name,
        description: vaccine.description,
        recommendedAge: vaccine.recommendedAge,
        dosesRequired: vaccine.dosesRequired,
        sideEffects: vaccine.sideEffects,
        diseasesCovered: vaccine.diseasesCovered.map((disease) => disease.name),
        id: vaccine._id,
      }));

      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error searching for vaccines: ${error.message}`;
    }
  }
}

// Tool: Get vaccines for specific diseases
class VaccineForDiseaseTool extends Tool {
  name = "vaccine_for_disease";
  description = `
    Find vaccines that protect against a specific disease.
    Use this tool when:
    - The user asks: "What vaccines are available for [disease]?"
    - The user wants protection options for a specific illness
    This tool first verifies if the disease exists in the database, and then returns all vaccines
    linked to that disease. The results include vaccine descriptions, age recommendations, doses required,
    side effects, and the diseases covered.
    `;

  async _call(input) {
    try {
      const diseaseName = escapeRegExp(input.toLowerCase());

      const disease = await Disease.findOne({
        name: { $regex: diseaseName, $options: "i" },
        approved: true,
      });

      if (!disease) {
        return `Disease "${input}" not found in our database.`;
      }

      const vaccines = await Vaccine.find({
        diseasesCovered: disease._id,
        approved: true,
      }).populate("diseasesCovered", "name");

      if (vaccines.length === 0) {
        return `No vaccines found that protect against ${disease.name}.`;
      }

      const results = vaccines.map((vaccine) => ({
        name: vaccine.name,
        description: vaccine.description,
        recommendedAge: vaccine.recommendedAge,
        dosesRequired: vaccine.dosesRequired,
        sideEffects: vaccine.sideEffects,
        diseasesCovered: vaccine.diseasesCovered.map((d) => d.name),
      }));

      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error finding vaccines for disease: ${error.message}`;
    }
  }
}

// Tool: Get all available diseases
class GetAllDiseasesTool extends Tool {
  name = "get_all_diseases";
  description = `
    Retrieve a list of all diseases available in the database (only those that are approved).
    Use this tool when:
    - The user asks for a full list of diseases (e.g., "Show me all diseases you know")
    - The user wants to browse through diseases before asking specifics
    The tool returns each disease with its name, description, and affected areas.
    `;

  async _call() {
    try {
      const diseases = await Disease.find({ approved: true }).select(
        "name description affectedAreas"
      );

      if (diseases.length === 0) {
        return "No diseases are currently available in the database.";
      }

      const results = diseases.map((disease) => ({
        name: disease.name,
        description: disease.description,
        affectedAreas: disease.affectedAreas,
      }));

      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error fetching all diseases: ${error.message}`;
    }
  }
}

// Tool: Get all available vaccines
class GetAllVaccinesTool extends Tool {
  name = "get_all_vaccines";
  description = `
    Retrieve a list of all vaccines available in the database (only those that are approved).
    Use this tool when:
    - The user asks for a complete list of vaccines (e.g., "List all vaccines")
    - The user wants to browse through vaccines before narrowing down
    The tool returns each vaccine with details such as name, description, recommended age,
    dose requirements, side effects, and diseases it protects against.
    `;

  async _call() {
    try {
      const vaccines = await Vaccine.find({ approved: true })
        .populate("diseasesCovered", "name")
        .select(
          "name description recommendedAge dosesRequired sideEffects diseasesCovered"
        );

      if (vaccines.length === 0) {
        return "No vaccines are currently available in the database.";
      }

      const results = vaccines.map((vaccine) => ({
        name: vaccine.name,
        description: vaccine.description,
        recommendedAge: vaccine.recommendedAge,
        dosesRequired: vaccine.dosesRequired,
        sideEffects: vaccine.sideEffects,
        diseasesCovered: vaccine.diseasesCovered.map((disease) => disease.name),
      }));

      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error fetching all vaccines: ${error.message}`;
    }
  }
}

// Initialize tools
const tools = [
  new DiseaseSearchTool(),
  new VaccineSearchTool(),
  new VaccineForDiseaseTool(),
  new GetAllDiseasesTool(),
  new GetAllVaccinesTool(),
  new DiseaseByCityTool()
];

// Create the system prompt
const systemPrompt = `You are a knowledgeable and helpful vaccine and disease information assistant. Your role is to provide accurate, helpful information about diseases, vaccines, and public health topics.

Key capabilities:
- Search for specific diseases and provide detailed information
- Search for vaccines and their details (dosage, side effects, age recommendations)
- Find vaccines that protect against specific diseases
- Provide comprehensive lists of available diseases and vaccines
- Answer questions about vaccination schedules, side effects, and recommendations
- Search for list of diseases present in a city and vaccines for each of them  

Guidelines:
1. Always be accurate and evidence-based in your responses
2. If you don't have information about something, say so clearly
3. Use the search tools to find specific information when needed
4. Provide comprehensive but easy-to-understand explanations
5. Be empathetic and supportive, especially when discussing health concerns
6. Encourage users to consult healthcare professionals for medical advice
7. Format responses clearly with proper structure and bullet points when appropriate
8. Only mention the diseases, vaccines present in the database

When users ask questions:
- Use the appropriate search tools to find relevant information
- Provide context and explanations, not just raw data
- If multiple results are found, help users understand the differences
- Always remind users that you provide information but cannot replace professional medical advice

Remember: You are a helpful assistant, not a medical professional. Always encourage users to consult with healthcare providers for personalized medical advice.`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

// Initialize the agent
let agentExecutor = null;

const initializeAgent = async () => {
  const llm = initializeLLM();

  if (!llm) {
    console.log("No LLM configured, using fallback response system");
    return null;
  }

  try {
    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true, // keeps messages in proper LangChain format
      chatHistory: [],
    });

    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools,
      prompt,
      memory
    });

    agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: process.env.NODE_ENV === "development",
    });

    console.log("LangChain agent initialized successfully");
  } catch (error) {
    console.error("Error initializing LangChain agent:", error);
    return null;
  }
};

// Initialize agent on startup
initializeAgent();

// Get all approved diseases and vaccines for chatbot context
const getChatbotContext = catchAsyncErrors(async (req, res) => {
  const diseases = await Disease.find({ approved: true }).select(
    "name description affectedAreas"
  );
  const vaccines = await Vaccine.find({ approved: true })
    .populate("diseasesCovered", "name")
    .select(
      "name description recommendedAge dosesRequired sideEffects diseasesCovered"
    );

  const context = {
    diseases: diseases.map((disease) => ({
      name: disease.name,
      description: disease.description,
      affectedAreas: disease.affectedAreas,
    })),
    vaccines: vaccines.map((vaccine) => ({
      name: vaccine.name,
      description: vaccine.description,
      recommendedAge: vaccine.recommendedAge,
      dosesRequired: vaccine.dosesRequired,
      sideEffects: vaccine.sideEffects,
      diseasesCovered: vaccine.diseasesCovered.map((disease) => disease.name),
    })),
  };

  res.status(200).json({ success: true, data: context });
});

// Process user question and generate response using LangChain
const processQuestion = catchAsyncErrors(async (req, res, next) => {
  const { question, messages } = req.body;
  if (!question || typeof question !== "string" || !question.trim()) {
    return next(new ErrorHandler("Question is required", 400));
  }

  let response;

  if (agentExecutor) {
    try {
      const result = await agentExecutor.invoke({
        input: question,
        chat_history: messages?.map(m => (
          m.sender === "bot" ? new AIMessage(m.text) : new HumanMessage(m.text)
        )) || [],
      });
      response = result.output;
    } catch (error) {
      console.error("LangChain agent error:", error);
      response = await generateFallbackResponse(question);
    }
  } else {
    response = await generateFallbackResponse(question);
  }

  res.status(200).json({ success: true, data: { response, question } });
});

// Fallback response generator
async function generateFallbackResponse(question) {
  try {
    const diseases = await Disease.find({ approved: true });
    const vaccines = await Vaccine.find({ approved: true }).populate(
      "diseasesCovered",
      "name"
    );

    const questionLower = question.toLowerCase();

    if (
      questionLower.includes("disease") ||
      questionLower.includes("illness") ||
      questionLower.includes("sickness")
    ) {
      if (
        questionLower.includes("list") ||
        questionLower.includes("all") ||
        questionLower.includes("what")
      ) {
        const diseaseList = diseases.map((d) => d.name).join(", ");
        return `Here are the diseases in our database: ${diseaseList}. You can ask me about specific diseases for more details.`;
      }

      for (const disease of diseases) {
        if (questionLower.includes(disease.name.toLowerCase())) {
          return `**${disease.name}**: ${disease.description}. ${
            disease.affectedAreas.length > 0
              ? `Affected areas: ${disease.affectedAreas.join(", ")}.`
              : ""
          }`;
        }
      }
    }

    if (
      questionLower.includes("vaccine") ||
      questionLower.includes("vaccination") ||
      questionLower.includes("shot")
    ) {
      if (
        questionLower.includes("list") ||
        questionLower.includes("all") ||
        questionLower.includes("what")
      ) {
        const vaccineList = vaccines.map((v) => v.name).join(", ");
        return `Here are the vaccines in our database: ${vaccineList}. You can ask me about specific vaccines for more details.`;
      }

      for (const vaccine of vaccines) {
        if (questionLower.includes(vaccine.name.toLowerCase())) {
          const diseaseNames = vaccine.diseasesCovered
            .map((d) => d.name)
            .join(", ");
          const sideEffects =
            vaccine.sideEffects.length > 0
              ? vaccine.sideEffects.join(", ")
              : "None specified";
          return `**${vaccine.name}**: ${vaccine.description}. Recommended age: ${vaccine.recommendedAge}. Doses required: ${vaccine.dosesRequired}. Diseases covered: ${diseaseNames}. Side effects: ${sideEffects}.`;
        }
      }
    }

    if (questionLower.includes("age") || questionLower.includes("when")) {
      const ageVaccines = vaccines.filter((v) =>
        questionLower.includes(v.recommendedAge.toLowerCase())
      );
      if (ageVaccines.length > 0) {
        const vaccineList = ageVaccines
          .map((v) => `${v.name} (${v.recommendedAge})`)
          .join(", ");
        return `For ${ageVaccines[0].recommendedAge}, these vaccines are recommended: ${vaccineList}.`;
      }
    }

    if (
      questionLower.includes("side effect") ||
      questionLower.includes("reaction")
    ) {
      const sideEffectsList = vaccines
        .filter((v) => v.sideEffects.length > 0)
        .map((v) => `${v.name}: ${v.sideEffects.join(", ")}`)
        .join("\n");
      return (
        sideEffectsList ||
        "No specific side effects are documented in our database."
      );
    }

    if (
      questionLower.includes("dose") ||
      questionLower.includes("how many")
    ) {
      const doseInfo = vaccines
        .map((v) => `${v.name}: ${v.dosesRequired} dose(s)`)
        .join(", ");
      return `Dose requirements: ${doseInfo}.`;
    }

    if (
      questionLower.includes("help") ||
      questionLower.includes("what can you do")
    ) {
      return `I can help you with information about diseases and vaccines! You can ask me:
      - List all diseases or vaccines
      - Information about specific diseases (e.g., "Tell me about COVID-19")
      - Information about specific vaccines (e.g., "Tell me about Pfizer vaccine")
      - Age-appropriate vaccines (e.g., "What vaccines for children?")
      - Side effects of vaccines
      - Dose requirements for vaccines
      - Vaccines for specific diseases
      - Search for diseases by symptoms or affected areas`;
    }

    return "I'm sorry, I couldn't find specific information about that. Try asking about diseases, vaccines, or type 'help' to see what I can assist you with.";
  } catch (error) {
    return "I'm having trouble accessing the database right now. Please try again later.";
  }
}

export { getChatbotContext, processQuestion };