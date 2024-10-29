# **Tomogatch.AI** 🐾

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)  
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Render](https://img.shields.io/badge/Render-00979D?style=for-the-badge&logo=render&logoColor=white)

🌐 **[Live Demo](https://tomogatch-ai.onrender.com/)**

---

## **Project Description**

**Tomogatch.AI** is a playful, interactive virtual pet app built with **React** on the front end and **Node.js** + **Express** for the backend. The pet dynamically interacts with the user, creating engaging experiences through real-time chat interactions powered by **GPT-based AI**.

The virtual pet adapts over time based on **user interactions**, evolving its responses and behaviors. While the **local chat history** is managed on the client side to minimize latency, summaries are periodically stored in a **SQL database** for long-term memory and continuity across sessions.

This project is designed to evolve over time, ensuring its functionality grows with user feedback and expanding capabilities.

---

## **Features**

- **Real-time chat interactions** with a virtual pet.
- **Context-aware responses** leveraging AI-backed logic.
- **Persistent memory** using SQL for long-term engagement.
- **Client-side chat management** with periodic memory synchronization.
- **Interactive UI** built with React for a seamless user experience.
- **Full-stack deployment** on Render for easy accessibility.

---

## **Technologies Used**

- **Backend**: Node.js, Express.js
- **Frontend**: React, TypeScript
- **Database**: SQL-based storage (e.g., PostgreSQL)
- **AI Integration**: OpenAI GPT model
- **Deployment**: Render
- **Version Control**: GitHub

---

## **Setup and Installation**

Follow these steps to get the application running on your local machine:

1. **Clone the Repository**

   ```bash
   git clone <your-repository-url>
   cd Tomogatch.ai
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**  
   Create a `.env` file in the root directory and add the necessary environment variables:

   ```
   OPENAI_API_KEY=<your-openai-api-key>
   DATABASE_URL=<your-database-url>
   ```

4. **Run the Application**

   ```bash
   npm run start
   ```

5. **Access the App**  
   Open your browser and navigate to `http://localhost:3001`.

---

## **Usage**

1. **Adopt a Virtual Pet**: Choose your cat and give it a name.
2. **Chat with Your Pet**: Interact through real-time chat to build a relationship with your pet.
3. **Experience Pet Growth**: See your pet evolve based on how you treat it.
4. **Long-Term Memory Updates**: Enjoy contextual interactions that reflect past interactions.

---

## **Project Structure**

```
Tomogatch.ai/
├── client/                 # React frontend
├── server/                 # Express backend
│   ├── controllers/        # API request handlers
|   |-- templates/          # Prompt Templating
|   |-- middleware/         # JWT Authentication
|   |-- seeds/              # Seed data for testing db
│   ├── models/             # SQL database models
│   ├── routes/             # API endpoints
│   └── templates/          # Custom prompt templates for GPT
├── .env                    # Environment variables
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

---

## **Contributors**

This project is a collaborative effort by the following contributors:


<table>
  <tr>
    <td align="center">
      <a href="https://github.com/[NAME_HERE]">
        <img src="https://github.com/[NAME_HERE].png?size=100" width="100px;" alt="[NAME_HERE]'s Avatar"/>
        <br />
        <sub><b>Dario</b></sub>
      </a>
      <br />
      <a href="mailto:dario@example.com">dario@example.com</a>
    </td>
    <td align="center">
      <a href="https://github.com/souad-hb">
        <img src="https://github.com/souad-hb.png?size=100" width="100px;" alt="souad-hb's Avatar"/>
        <br />
        <sub><b>Souad</b></sub>
      </a>
      <br />
      <a href="mailto:souadsalahh@gmail.com">souadsalahh@gmail.com</a>
    </td>
    <td align="center">
      <a href="https://github.com/OccultParrot">
        <img src="https://github.com/OccultParrot.png?size=100" width="100px;" alt="OccultParrot's Avatar"/>
        <br />
        <sub><b>Thomas</b></sub>
      </a>
      <br />
      <a href="mailto:stemlertho@gmail.com">stemlertho@gmail.com</a>
    </td>
    <td align="center">
      <a href="https://github.com/savevsgames">
        <img src="https://github.com/savevsgames.png?size=100" width="100px;" alt="savevsgames's Avatar"/>
        <br />
        <sub><b>Greg</b></sub>
      </a>
      <br />
      <a href="mailto:gregcbarker@gmail.com">gregcbarker@gmail.com</a>
    </td>
  </tr>
</table>

---

## **License**

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## **Acknowledgments**

Special thanks to all contributors and the open-source community for their tools and frameworks that made this project possible.

---

## **Future Enhancements**

- **Gamification**: Introduce more interactions like toys, rewards, and challenges.
- **Advanced Memory Management**: Implement smarter AI with enhanced memory capabilities.
- **Push Notifications**: Alert users when the pet needs attention.
- **Mobile App**: Expand the application to mobile platforms.
