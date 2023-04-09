.chatbox-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  
  .message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    max-width: 70%;
  }
  
  .message.bot {
    align-items: flex-end;
  }
  
  .message p {
    margin: 0;
  }
  
  .input-form {
    display: flex;
    margin-top: 1rem;
  }
  
  .input-form input {
    flex: 1;
    margin-right: 1rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: none;

    