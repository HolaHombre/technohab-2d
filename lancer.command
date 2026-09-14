#!/bin/zsh
# Ouvre l'aperçu local de TechnoHab dans une fenêtre Terminal visible.
set -e

PROJECT_DIR="${0:A:h}"
cd "$PROJECT_DIR"

echo "Démarrage de TechnoHab sur http://127.0.0.1:8001"
echo "Pour arrêter : revenez dans cette fenêtre et appuyez sur Contrôle-C."
exec npm run serve

