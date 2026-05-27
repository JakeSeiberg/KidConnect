Kid Connect Application

## Installation

### Requirements
- Python 3.9 or higher

---

### 1. Clone the repository

```bash
git clone <repository-url>
cd KidConnect
```

---

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` appear at the start of your terminal prompt.

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Run the application

```bash
python app.py
```

Open `http://127.0.0.1:5001` in your browser to use the application.

---

### 5. Deactivate the virtual environment (when finished)

```bash
deactivate
```

---

### Troubleshooting

**`TypeError: 'type' object is not subscriptable`**
You are running Python 3.8 or lower. Please ensure Python 3.9 or higher is installed and used when creating the venv:
```bash
python3 --version
```

Authors: Jake Seiberg, Reid Allenstein, Ben Elster, Abby Appling