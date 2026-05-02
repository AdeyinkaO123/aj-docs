from database import SessionLocal, engine, Base
from models import User, Document


def seed():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        users = [
            User(id=1, name="Alice", email="alice@ajaia.com", avatar_color="#7C3AED"),
            User(id=2, name="Bob", email="bob@ajaia.com", avatar_color="#0D9488"),
            User(id=3, name="Carol", email="carol@ajaia.com", avatar_color="#DC2626"),
        ]
        db.add_all(users)
        db.commit()

        welcome = Document(
            title="Welcome to Ajaia Docs",
            content=(
                "<h1>Welcome to Ajaia Docs</h1>"
                "<p>Start writing your documents here. You can <strong>bold</strong>, "
                "<em>italicize</em>, and <u>underline</u> text.</p>"
                "<p>Use the toolbar above to format your content, or upload an existing "
                "<code>.txt</code>, <code>.md</code>, or <code>.docx</code> file.</p>"
            ),
            owner_id=1,
        )
        db.add(welcome)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed()
    print("Seeded: Alice, Bob, Carol + welcome doc")
