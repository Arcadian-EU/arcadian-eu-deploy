import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import publish_site


class PromotionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="arcadian publisher test ")
        self.root = Path(self.temp.name)
        self.previous_cwd = Path.cwd()
        self.source = str(self.root / "corporate.git")
        self.mirror = str(self.root / "publication.git")
        for repo in (self.source, self.mirror):
            self.run_git("init", "--bare", "--initial-branch=main", repo)
        self.run_git("clone", self.source, str(self.root / "work"))
        os.chdir(self.root / "work")
        self.run_git("config", "user.name", "Publisher test")
        self.run_git("config", "user.email", "publisher@example.invalid")
        self.base = self.commit("base")
        self.run_git("push", self.source, "HEAD:main")
        self.run_git("push", self.mirror, "HEAD:main", "HEAD:recovery")
        self.candidate = self.commit("candidate")
        self.run_git("push", self.source, "HEAD:main")

    def tearDown(self):
        os.chdir(self.previous_cwd)
        self.temp.cleanup()

    def run_git(self, *args):
        return subprocess.check_output(["git", *args], text=True, stderr=subprocess.PIPE).strip()

    def commit(self, value):
        Path("content.txt").write_text(value)
        self.run_git("add", "content.txt")
        self.run_git("commit", "-m", value)
        return self.run_git("rev-parse", "HEAD")

    def test_promotes_exact_commit_and_preserves_other_branches(self):
        self.assertTrue(publish_site.promote(self.candidate, self.source, self.mirror))
        self.assertEqual(publish_site.remote_head(self.mirror), self.candidate)
        self.assertTrue(self.run_git("ls-remote", self.mirror, "refs/heads/recovery").startswith(self.base))
        self.assertTrue(publish_site.promote(self.candidate, self.source, self.mirror))

    def test_superseded_run_does_not_publish(self):
        latest = self.commit("newer")
        self.run_git("push", self.source, "HEAD:main")
        self.run_git("checkout", "--detach", self.candidate)
        self.assertFalse(publish_site.promote(self.candidate, self.source, self.mirror))
        self.assertEqual(publish_site.remote_head(self.mirror), self.base)
        self.assertEqual(publish_site.remote_head(self.source), latest)

    def test_divergent_mirror_is_not_overwritten(self):
        self.run_git("checkout", "--detach", self.base)
        unrelated = self.commit("mirror-only")
        self.run_git("push", self.mirror, "HEAD:main")
        self.run_git("checkout", "--detach", self.candidate)
        with self.assertRaisesRegex(RuntimeError, "diverged"):
            publish_site.promote(self.candidate, self.source, self.mirror)
        self.assertEqual(publish_site.remote_head(self.mirror), unrelated)

    def test_wrong_checkout_is_rejected(self):
        with self.assertRaisesRegex(RuntimeError, "Checkout"):
            publish_site.promote(self.base, self.source, self.mirror)
        self.assertEqual(publish_site.remote_head(self.mirror), self.base)


class DeploymentProofTests(unittest.TestCase):
    def test_public_or_pull_request_context_cannot_publish(self):
        context = {"GITHUB_SERVER_URL": "https://arcadian-spzoo.ghe.com", "GITHUB_REPOSITORY": "Arcadian-EU/arcadian-eu-deploy", "GITHUB_REF": "refs/heads/main", "GITHUB_EVENT_NAME": "push"}
        publish_site.validate_context(context)
        for key, value in [("GITHUB_EVENT_NAME", "pull_request"), ("GITHUB_SERVER_URL", "https://github.com"), ("GITHUB_REF", "refs/heads/feature")]:
            with self.subTest(key=key), self.assertRaises(RuntimeError):
                publish_site.validate_context(dict(context, **{key: value}))

    def test_waits_for_exact_served_commit(self):
        replies = [io.BytesIO(json.dumps({"commit": value}).encode()) for value in ["b" * 40, "a" * 40]]
        with patch.object(publish_site, "urlopen", side_effect=replies) as request, patch.object(publish_site.time, "sleep"):
            publish_site.wait_for_deployment("a" * 40)
        self.assertEqual(request.call_count, 2)

    def test_http_success_with_wrong_commit_is_not_deployment_proof(self):
        with patch.object(publish_site, "urlopen", return_value=io.BytesIO(b'{"commit":"wrong"}')), patch.object(publish_site.time, "monotonic", side_effect=[0, 0, 0, 2]), patch.object(publish_site.time, "sleep"):
            with self.assertRaisesRegex(RuntimeError, "not served"):
                publish_site.wait_for_deployment("a" * 40, timeout=1)


if __name__ == "__main__":
    unittest.main()
