#!/usr/bin/env python3
"""Codex notify 훅 — agent 턴 완료 시 macOS 알림을 띄운다.

Codex CLI는 이벤트를 JSON 문자열 한 개로 인자에 담아 이 프로그램을 호출한다.
~/.codex/config.toml 에서 다음과 같이 등록한다:

    notify = ["/Users/kim/develop/finsight/scripts/codex-notify.py"]

수신 payload 예:
    {"type": "agent-turn-complete",
     "turn-id": "...",
     "input-messages": ["..."],
     "last-assistant-message": "..."}
"""

import json
import os
import subprocess
import sys


def _notify(title: str, message: str) -> None:
    # 메시지를 환경변수로 넘기고 AppleScript의 `system attribute`로 읽어
    # osascript 인자 escaping/주입 문제를 원천 차단한다.
    env = dict(os.environ, CODEX_NOTIFY_TITLE=title, CODEX_NOTIFY_MSG=message)
    subprocess.run(
        [
            "osascript",
            "-e",
            'display notification (system attribute "CODEX_NOTIFY_MSG") '
            'with title (system attribute "CODEX_NOTIFY_TITLE") '
            'sound name "Glass"',
        ],
        env=env,
        check=False,
    )


def main() -> None:
    if len(sys.argv) < 2:
        return
    try:
        event = json.loads(sys.argv[1])
    except (ValueError, TypeError):
        return

    if event.get("type") != "agent-turn-complete":
        return

    msg = (event.get("last-assistant-message") or "턴 완료").strip()
    if len(msg) > 240:
        msg = msg[:239] + "…"
    _notify("Codex ✓", msg)


if __name__ == "__main__":
    main()
