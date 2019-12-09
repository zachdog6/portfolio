package generate;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.embed.swing.SwingFXUtils;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.DirectoryChooser;
import javafx.stage.FileChooser;
import javafx.stage.Window;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.ColorModel;
import java.awt.image.WritableRaster;
import java.io.File;
import java.io.IOException;

public class MainController {

    @FXML
    VBox center;
    @FXML
    TextField size;
    @FXML
    HBox top;
    @FXML
    VBox right;
    BufferedImage pixelatedImage;
    String fileName;
    String fileFormat;

    @FXML
    public void initialize() {
        size.textProperty().addListener(new ChangeListener<String>() {
            public void changed(ObservableValue<? extends String> observable, String oldValue, String newValue) {
                if (!newValue.matches("\\d*")) {
                    int newValueInt = Integer.parseInt(newValue);
                    if(newValueInt < 100) {
                        size.setText(newValue.replaceAll("[^\\d]", ""));
                    }
                }
            }
        });
    }

    @FXML
    public void upload(ActionEvent event) throws IOException, InterruptedException {
        Node source = (Node) event.getSource();
        Window stage = source.getScene().getWindow();

        FileChooser fileChooser = new FileChooser();
        File file = fileChooser.showOpenDialog(stage);
        if (file != null) {
            center.getChildren().clear();

            fileName = file.getName();
            fileFormat = FilenameUtils.getExtension(fileName);

            BufferedImage beforeImage = ImageIO.read(file);
            ImageView beforeImageView = generateImageView(beforeImage, stage);
            center.getChildren().add(beforeImageView);

            int pixelSize = 8;
            if(StringUtils.isNotBlank(size.getText()))
                pixelSize = Integer.parseInt(size.getText());

            BufferedImage afterImage = deepCopy(beforeImage);
            PixelArtGenerator generator = new PixelArtGenerator(afterImage, pixelSize);
            pixelatedImage = generator.getTransformedImage();

            ImageView afterImageView = generateImageView(pixelatedImage, stage);
            center.getChildren().add(afterImageView);
        }
    }

    private ImageView generateImageView(BufferedImage image, Window stage) {
        Image fxImage = SwingFXUtils.toFXImage(image, null);

        ImageView imageView = new ImageView();
        imageView.setImage(fxImage);
        imageView.fitHeightProperty().bind(stage.heightProperty().subtract(top.heightProperty().add(50)).divide(2));
        imageView.fitWidthProperty().bind(stage.widthProperty().subtract(right.widthProperty()));
        imageView.setPreserveRatio(true);

        return imageView;
    }

    @FXML
    public void download(ActionEvent event) throws IOException {
        Node source = (Node) event.getSource();
        Window stage = source.getScene().getWindow();

        DirectoryChooser dirChooser = new DirectoryChooser();
        String chosenDirPath = dirChooser.showDialog(stage).getPath() + "\\pixelated_" + fileName;
        File outputFile = new File(chosenDirPath);

        ImageIO.write(pixelatedImage, fileFormat, outputFile);
    }

    /*
     * Author: https://stackoverflow.com/questions/3514158/how-do-you-clone-a-bufferedimage
     */
    static BufferedImage deepCopy(BufferedImage bi) {
        ColorModel cm = bi.getColorModel();
        boolean isAlphaPremultiplied = cm.isAlphaPremultiplied();
        WritableRaster raster = bi.copyData(null);
        return new BufferedImage(cm, raster, isAlphaPremultiplied, null);
    }
}
