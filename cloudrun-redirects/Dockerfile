FROM python:3.9-slim@sha256:2d97f6910b16bd338d3060f261f53f144965f755599aab1acda1e13cf1731b1b
COPY index.html /app/index.html
WORKDIR /app
CMD python3 -m http.server ${PORT:-8080}
