# presta.zip — distributions communautaires

Catalogue indépendant de compilations PrestaShop. Non affilié à PrestaShop.

Les archives ZIP et les fichiers XML sont disponibles dans les Releases de ce
dépôt. Les archives sont compilées à partir du dépôt officiel PrestaShop, au tag
correspondant à chaque version. Le fichier `manifests/releases.json` répertorie
leurs tailles, leurs empreintes SHA-256 et les références du code source.

## Vérifier un téléchargement

Télécharger le ZIP et SHA256SUMS depuis la même release, calculer son SHA-256
avec `sha256sum fichier.zip` (Linux), `shasum -a 256 fichier.zip` (macOS), ou
`Get-FileHash fichier.zip -Algorithm SHA256` (PowerShell), puis comparer.
Le XML est destiné à Update Assistant ; ce n'est pas une signature du ZIP.
Les empreintes ne sont pas signées. Une compromission du compte GitHub pourrait
permettre de remplacer à la fois une archive et son empreinte.

Les anciennes versions ne sont pas nécessairement sûres pour la production.
Effectuer une sauvegarde et tester toute mise à jour sur une boutique de test.

## Sources et compilation

Sources amont : https://github.com/PrestaShop/PrestaShop

La page historique indique utiliser l'outil `tools/build/CreateRelease.php` de
PrestaShop. Consulter son README au tag correspondant pour les prérequis :
https://github.com/PrestaShop/PrestaShop/tree/9.2.0/tools/build

Le catalogue standard reprend les archives existantes. Les variantes personnalisées
sont décrites séparément ci-dessous.
Les licences du logiciel et de ses dépendances restent celles incluses dans les ZIP.

## Variante 9.2.0 sans One Page Checkout

[Téléchargements ZIP, XML et SHA256SUMS](https://github.com/Touxten/presta-distributions/releases/tag/v9.2.0-no-opc).
La version standard reste inchangée. Cette variante part de la compilation locale
9.2.0 (commit amont `84db6bd3a3c1612535b15b9df934afd609085423`). Le paquet
`prestashop/ps_onepagecheckout` 0.6.7 a été retiré via Composer, sans mise à jour
des autres dépendances. L’autoload et le XML de sommes de contrôle sont régénérés.
Les métadonnées sont dans `manifests/variants.json`.

Variante de test : installation et mise à jour complètes non validées. Des alertes
de sécurité ont été relevées dans les dépendances de la base utilisée ; cette
archive n’est pas recommandée pour la production. Elle ne désinstalle pas à elle
seule un module OPC déjà présent dans une boutique existante.

Vérifier le contenu de l’archive et le XML correspondant :

```sh
php scripts/verify-no-opc.php prestashop_9.2.0-no-opc.zip prestashop_9.2.0-no-opc.xml
```

## Site statique

Node.js 22 ou supérieur, sans dépendance supplémentaire :

```sh
node scripts/build.mjs
```

Déployer uniquement `site/index.html`, `site/style.css`, `site/app.js` et
`site/favicon.svg`. Les téléchargements sont des liens directs vers GitHub.
La liste est rendue en HTML : elle reste utilisable sans JavaScript ni API GitHub.
`scripts/import.mjs` importe l'inventaire historique et calcule les empreintes.
Ne jamais committer d'identifiants serveur, de secrets ou d'archives dans Git.

Les anciens chemins `/zip/` sont conservés sur le serveur pour les liens existants.
