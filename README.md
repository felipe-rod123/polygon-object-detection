# frontend-overview-case

Felipe Rodrigues' front-end take-home test.

## Polygon 🖌️

_Polygon_ is an object detection (segmentation) labeling tool designed to facilitate the creation of high-quality annotations for AI computer vision models.

### Features ✅

#### Annotation Options

- **Brush Annotation**: Toggle between brush, polygon and rectangle annotation modes.
- **Brush Size**: Allow users to choose the stroke size when in draw mode.

#### Class Management

- **Define Classes**: Provide a way to define class names and assign a unique color to each class.

#### Editing Tools

- **Eraser Tool**: Include an eraser tool to remove annotations.
- **Undo Functionality**: Provide undo functionality to reverse the last action.

#### Canvas

- **Interactive Canvas**: Use Fabric.js for interactive canvas manipulation.
- **Responsive Layout**: Ensure a responsive layout suitable for smaller screens.

#### Export Features

- **Export Annotations**: Provide an option to export the annotations in COCO of PNG file formats.

### Installation Prerequisites 🛠️

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (version 6 or higher)

### Setup and Run 🚀

To set up and run the project locally, follow these steps:

1. Clone the repository:

```sh
git clone <repo-url>
cd polygon
```

2. Install the dependencies and start the development server:

```sh
npm i && npm run dev
```

3. Open the browser and navigate to `http://localhost:<port>` to view the application.
4. Run Prettier on the entire codebase to format it according to the defined rules:

```sh
npm run format
```

### Use a Virtual Environment to Test the API (api.py) 🧪

To test the API using a virtual environment, follow these steps:

#### Requirements

- **Flask** v2.3.3
- **pydantic** v1.10.11

#### Steps

1. **Create a virtual environment:**

```sh
python3 -m venv venv
```

2. **Activate the virtual environment:**

- On Linux/macOS:

  ```sh
  source venv/bin/activate
  ```

- On Windows:

  ```sh
  venv\Scripts\activate
  ```

3. **Install dependencies inside the virtual environment:**

```sh
pip install Flask==2.3.3 pydantic==1.10.11
```

4. **Run the API:**

```sh
python api.py
```

5. **Test the API using Postman:**

- Open **Postman** and create a new POST request.
- Enter the URL: `http://localhost:5002/validate`
- Go to the _Body_ tab, select _raw_, and set the type to _JSON_.
- Paste the COCO JSON data and click _Send_.

#### Success Response

If the request is valid, you should receive a `200` response with:

```json
{ "message": "Success" }
```

#### Error Response

If there is an error in the request body, you might receive a `422 UNPROCESSABLE ENTITY` response with details about the validation errors. For example:

```json
{
  "details": [
    {
      "loc": ["categories", 0, "id"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["categories", 0, "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "error": "Validation error"
}
```

### Contributing 🤝

This project is open source and contributions are welcome! Feel free to fork the repository and submit pull requests.

### License 📄

This project is licensed under the MIT License.

### Contact 📬

Reach out to me at my [GitHub](https://github.com/felipe-rod123) for any questions or feedback!
