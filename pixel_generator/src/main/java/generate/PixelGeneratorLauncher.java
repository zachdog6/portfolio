package generate;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;
import java.io.*;

public class PixelGeneratorLauncher extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    public void start(Stage stage) throws IOException {
        FXMLLoader loader = new FXMLLoader();
        InputStream fxmlStream = getClass().getResourceAsStream("/main_screen.fxml");

        BorderPane root = loader.load(fxmlStream);
        Scene scene = new Scene(root);
        stage.setScene(scene);
        stage.setTitle("Generate Pixel Art");
        stage.setMinWidth(500);
        stage.setMinHeight(400);
        stage.show();
    }
}