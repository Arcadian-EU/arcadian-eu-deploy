"""Translate the existing home/legal templates without changing their markup or facts."""
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'static-site'
COPY = json.loads(Path(__file__).with_name('german-copy.json').read_text())
KEEP = {'ARCADIAN', 'Werfvolt', 'Benelux', 'AutoCAD Electrical', 'KNX / DALI', 'Trimble Connect',
        'DALI-CTRL / E-401', 'KNX BUS', 'DALI-2 · DT8', 'RELAY 16A', 'ADDR 0x2F',
        'TONY K.', 'YURY K.', 'ANASTASIYA P.', 'ANATOLI V.', 'DAVID M.', 'LinkedIn', 'KRS',
        'REGON', 'VAT EU', 'KRS 0001242523', 'VAT PL1133202795', 'REGON 544816335',
        'ARCADIAN SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ', 'ARCADIAN Sp. z o.o.',
        'AVENTRO_LANG', 'arcadianTimeZone', 'arcadianCookieConsent.v1',
        'info@arcadian-eu.com', 'WhatsApp · +32 466 495 409', 'WhatsApp · +48 734 472 003',
        'English', 'Nederlands', 'Polski', 'Deutsch'}
ATTRS = {'alt', 'title', 'aria-label', 'placeholder', 'data-file-too-large',
         'data-turnstile-required', 'data-turnstile-error', 'data-turnstile-pending',
         'data-turnstile-unavailable', 'data-turnstile-expired', 'data-turnstile-config'}

def normalize(value):
    return re.sub(r'\s+', ' ', value).strip()

class GermanPage(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.output = []
        self.stack = []
        self.untranslated = set()

    def translate(self, value):
        key = normalize(value).replace('Sp.z.o.o.', 'Sp. z o.o.')
        if not key:
            return value
        if key in COPY:
            return re.match(r'^\s*', value)[0] + COPY[key] + re.search(r'\s*$', value)[0]
        if key not in KEEP and re.search(r'[A-Za-z]{3}', key):
            self.untranslated.add(key)
        return value

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        protected = bool(self.stack and self.stack[-1][1]) or tag in {'script', 'style'} or 'app-win' in values.get('class', '').split()
        raw = self.get_starttag_text()
        def attribute(match):
            name, quote, encoded = match.group(1, 2, 3)
            value = html.unescape(encoded)
            if name == 'lang' and tag == 'html':
                value = 'de'
            elif name == 'value' and tag == 'input' and values.get('name') == 'lang':
                value = 'de'
            elif name == 'href' and value.startswith('/') and not value.startswith(('/assets/', '/de/', '/nl/', '/pl/')):
                value = '/de' + value
            elif name == 'content' and values.get('property') == 'og:locale':
                value = 'de_DE'
            elif name in {'href', 'content'} and value.startswith('https://arcadian-eu.com/') and (values.get('rel') == 'canonical' or values.get('property') == 'og:url'):
                value = value.replace('https://arcadian-eu.com/', 'https://arcadian-eu.com/de/', 1)
            elif not protected and (name in ATTRS or name == 'content' and (values.get('name') in {'description', 'twitter:title', 'twitter:description'} or values.get('property') in {'og:title', 'og:description'})):
                value = self.translate(value)
            return f'{name}={quote}{html.escape(value, quote=True)}{quote}'
        raw = re.sub(r'''([\w:-]+)\s*=\s*(["'])(.*?)\2''', attribute, raw, flags=re.S)
        self.output.append(raw)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append((tag, protected))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        self.output.append(f'</{tag}>')
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_data(self, data):
        if self.stack and self.stack[-1][1]:
            self.output.append(data)
        else:
            self.output.append(html.escape(self.translate(data), quote=False))

    def handle_decl(self, declaration):
        self.output.append(f'<!{declaration}>')

    def handle_comment(self, data):
        self.output.append(f'<!--{data}-->')

for route in ['index.html', 'terms/index.html', 'privacy/index.html']:
    parser = GermanPage()
    parser.feed((ROOT / route).read_text())
    if parser.untranslated:
        raise SystemExit('Missing German copy in ' + route + ':\n' + '\n'.join(sorted(parser.untranslated)))
    target = ROOT / 'de' / route
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(''.join(parser.output))
print('Generated German homepage, terms and privacy from the existing source templates.')
