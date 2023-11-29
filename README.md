# FORUM APPLICATION

## OVERVIEW

This is an upgraded forum application designed to provide a seamless user experience with features such as user registration and login, posting, commenting, private messaging, and real-time interactions. The application is structured as a Single Page Application (SPA) and incorporates WebSockets for real-time communication.

![Forum Application](./assets/img/community.webp)

## INSTRUCTIONS

### GETTING STARTED

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/forum-application.git
   cd forum-application
   ```

2. **Setting Up Environment:**
   - Ensure you have Golang installed. If not, [download and install Golang](https://golang.org/dl/).
   - Make sure Docker is installed for easy deployment.

3. **Building and Running:**
   - Build and run the application using Docker:
     ```bash
     ./scripts/buildImage.sh
     ./scripts/init.sh
     ```

4. **Access the Application:**
   - Open a web browser and go to [http://localhost:8080](http://localhost:8080).

### FEATURES

- **User Authentication:**
  - Users can register with a unique nickname, age, gender, first name, last name, email, and password.
  - Login using either nickname or email combined with the password.
  - Logout from any page on the forum.

- **Posts and Comments:**
  - Create, view, edit, and delete posts.
  - Add comments to posts and view them in a feed display.

- **Private Messaging:**
  - Send private messages to other users.
  - Real-time messaging using WebSockets.
  - See who is online/offline.

- **Real-Time Actions:**
  - Real-time updates for posts, comments, and private messages.

### AUTHORS

- @pba
- @serignmbaye
