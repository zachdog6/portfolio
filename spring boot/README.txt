Basic chat app to demostrate Java, Spring Boot, JavaFX, Spring JDBC, and h2.

This was designed as a easy to run test, so it has no central database to keep of everything, and the method of communication (spring boot rest connections) will most likely be blocked by windows firewall be default. It is best to run both chat windows locally.

In chat window:
	save: save chat history
	new: open new chat with the shared connection string
	share: shows the connection string you need to give to the other person
	clear:	clear chat history
	send: send message to currently selected user

Need java and maven installed to run
Running:
	open cmd or console
	go to the MessageTest folder
	run mvn package
	go to the target folder and open the .jar file