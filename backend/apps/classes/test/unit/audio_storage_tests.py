from pathlib import Path
from tempfile import NamedTemporaryFile

from django.test import SimpleTestCase

from apps.classes.utils import persist_uploaded_audio


class PersistUploadedAudioTests(SimpleTestCase):
    def test_persist_uploaded_audio_writes_to_shared_location(self):
        with NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(b"audio-bytes")
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as audio_file:
                stored_path = persist_uploaded_audio(audio_file, filename="sample.wav")

            stored = Path(stored_path)
            self.assertTrue(stored.exists())
            self.assertTrue(stored.is_file())
            self.assertEqual(stored.read_bytes(), b"audio-bytes")
        finally:
            Path(tmp_path).unlink(missing_ok=True)
            Path(stored_path).unlink(missing_ok=True)
