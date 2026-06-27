# Deploying AlienHub.Store to the Red Hat VM

Runs the app + Postgres in Docker, so the VM's host Node/npm version doesn't matter.
Target VM in this setup: **192.168.68.108** (user `jalal`). App will be at
**http://192.168.68.108:3000**.

> Run everything below **on the VM** (SSH in: `ssh jalal@192.168.68.108`).

---

## 1. Install Docker (one time)

```bash
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"     # then log out/in (or run: newgrp docker)
docker --version && docker compose version
```

_(If the docker-ce repo errors on your RHEL release, swap the URL for
`https://download.docker.com/linux/centos/docker-ce.repo`. Podman also works — replace
`docker compose` with `podman compose` and install `podman podman-compose`.)_

## 2. Get the latest code

```bash
cd ~/alienhub.store          # wherever you cloned it
git pull
```

## 3. Configure secrets

```bash
cp .env.production.example .env
nano .env       # set DB_PASSWORD and AUTH_SECRET (generate: openssl rand -base64 32)
```

## 4. Start the database, load your existing data, then start the app

```bash
# a) bring up just Postgres
docker compose -f docker-compose.prod.yml up -d db

# b) wait ~10s, then load the data export (file: deploy/alienhub-full.sql — copied from dev)
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U alienhub -d alienhub < deploy/alienhub-full.sql

# c) build + start the web app (runs migrations, then serves)
docker compose -f docker-compose.prod.yml up -d --build web
```

> The data file `deploy/alienhub-full.sql` is **not** in git (it contains customer data).
> Copy it from the dev PC with:
> `scp deploy/alienhub-full.sql jalal@192.168.68.108:~/alienhub.store/deploy/`
> If you skip the data load, the store starts **empty** — create an admin + products from scratch.

## 5. Open the firewall

```bash
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

## 6. Use it

- Store:  **http://192.168.68.108:3000**
- Admin:  **http://192.168.68.108:3000/admin**  (admin@alienhub.store / alienhub — change it)

---

## Everyday commands

```bash
docker compose -f docker-compose.prod.yml logs -f web     # view logs
docker compose -f docker-compose.prod.yml restart web     # restart app
docker compose -f docker-compose.prod.yml down            # stop everything
git pull && docker compose -f docker-compose.prod.yml up -d --build web   # deploy an update
```

## Backups (DB → a file you can copy to your laptop)

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U alienhub -d alienhub > backup-$(date +%F).sql
```
