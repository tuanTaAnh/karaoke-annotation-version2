from flask import *
import os


app=Flask(__name__,template_folder='templates')


@app.route('/')
def upload():
    return render_template("annotator.html")

@app.route('/demo')
def demo():
    return render_template("dragdemo.html")

@app.route('/save', methods=["POST", "GET"])
def save_json():
    # POST request
    if request.method == 'POST':
        print('Incoming..')
        print(request.get_json()["data"])  # parse as JSON
        data = request.get_json()["data"]
        print("os.getcwd(): ", os.getcwd())

        annotationpath = 'static/json/annotations.json'

        print(os.path.exists(annotationpath))

        try:
            os.remove(annotationpath)
        except Exception as e:
            print("An exception occurred: ", e)

        with open(annotationpath, 'a') as f:
            f.write(data + '\n')

        return 'OK', 200

# @app.route('/getjson', methods=["POST", "GET"])
# def get_json():
#     return 'OK', 200

if __name__ == '__main__':
    app.run(debug=True)
