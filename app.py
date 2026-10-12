import logging
import os

from flask import Flask, jsonify, render_template

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("dino")

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    logger.info("Starting dev server on port %s", port)
    app.run(host="0.0.0.0", port=port)
