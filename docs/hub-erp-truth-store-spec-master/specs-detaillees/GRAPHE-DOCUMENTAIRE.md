# Graphe documentaire

Ce graphe met en avant les dépendances documentaires principales entre modules.
Il ne remplace pas les liens détaillés dans chaque fiche, il les synthétise.
Les flèches représentent ici des liens documentaires forts, pas nécessairement un ordre chronologique strict.

- Relation -> [GRAPHE-LIENS.md](./GRAPHE-LIENS.md) : version plus détaillée avec sources racines, matrices et relations nommées.

```mermaid
flowchart LR
  M12["Module 12 Facturation"]
  M13["Module 13 Encaissement / Recouvrement"]
  M14["Module 14 SAV / Maintenance / Ticketing"]
  M15["Module 15 Planning / Coordination"]
  M16["Module 16 Gouvernance / Validation / Contrôle interne"]
  M17["Module 17 Reporting / KPI / Direction"]
  M18["Module 18 Vue transverse Affaire / Projet"]
  M02["Module 02 Avant-vente"]
  M03["Module 03 Contrats / Affaires / Projets"]
  M04["Module 04 Budget / Pilotage financier projet"]
  M05["Module 05 Achats"]
  M06["Module 06 Stock / Logistique / Magasin"]
  M07["Module 07 Exécution terrain / OT"]
  M08["Module 08 PV / Preuves de réalisation"]
  M10["Module 10 Coûts analytiques / Rentabilité"]

  M13 --> M12
  M13 --> M16
  M13 --> M17
  M13 --> M18

  M14 --> M07
  M14 --> M08
  M14 --> M12
  M14 --> M16
  M14 --> M18

  M15 --> M03
  M15 --> M06
  M15 --> M07
  M15 --> M14
  M15 --> M18

  M16 --> M02
  M16 --> M04
  M16 --> M05
  M16 --> M12
  M16 --> M13
  M16 --> M18

  M17 --> M02
  M17 --> M04
  M17 --> M10
  M17 --> M12
  M17 --> M13
  M17 --> M14
  M17 --> M18

  M18 --> M02
  M18 --> M03
  M18 --> M07
  M18 --> M08
  M18 --> M12
  M18 --> M14
  M18 --> M17
```
