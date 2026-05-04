const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/layout/backoffice/backoffice.component.html');
let s = fs.readFileSync(file, 'utf8');

/** Longer / specific strings first */
const pairs = [
  ['OVERVIEW PAGE — visible seulement si selectedPage === \'dashboard\'', 'OVERVIEW PAGE — visible only when selectedPage === \'dashboard\''],
  ['PANNEAU ACTIVITÉ TEMPS RÉEL', 'REAL-TIME ACTIVITY PANEL'],
  ['LIGNE 3 PANELS', 'ROW OF 3 PANELS'],
  ['PAGE : REMBOURSEMENTS', 'PAGE: REPAYMENTS'],
  ['PAGE : VÉHICULES — données API (module véhicule, aligné FINIX-FRONTEND)', 'PAGE: VEHICLES — API data (vehicle module, aligned with FINIX-FRONTEND)'],
  ['PAGE : RÉSERVATIONS VÉHICULES (admin IMF)', 'PAGE: VEHICLE RESERVATIONS (admin IMF)'],
  ['PAGE : PARAMÈTRES', 'PAGE: SETTINGS'],
  ['28 Février 2026 · Samedi', 'Feb 28, 2026 · Saturday'],
  ["Vue d'ensemble", 'Overview'],
  ['1 248 clients actifs · 3 décisions en attente · Système opérationnel ✓', '1,248 active clients · 3 pending decisions · System operational ✓'],
  ['Export rapport', 'Export report'],
  ['+ Nouveau dossier', '+ New file'],
  ['↑ +23 ce mois', '↑ +23 this month'],
  ['Clients actifs', 'Active clients'],
  ['Taux de rétention :', 'Retention rate:'],
  ['Encours total', 'Total outstanding'],
  ['Collecté ce mois :', 'Collected this month:'],
  ['↑ +2 vs hier', '↑ +2 vs yesterday'],
  ['Impayés actifs', 'Active delinquencies'],
  ['Taux de défaut :', 'Default rate:'],
  ['Activité en temps réel', 'Real-time activity'],
  ['Dossiers / mois', 'Files / month'],
  ['Dossiers soumis', 'Files submitted'],
  ['ce mois', 'this month'],
  ['Fév 2026', 'Feb 2026'],
  ['Top conseillers', 'Top advisors'],
  ['Impayés & retards', 'Delinquencies & late payments'],
  ['12 cas actifs', '12 active cases'],
  ['Voir tout →', 'View all →'],
  ['<th>Dossier</th>', '<th>File</th>'],
  ['<th>Montant dû</th>', '<th>Amount due</th>'],
  ['<th>Retard</th>', '<th>Days overdue</th>'],
  ['<th>Tentatives</th>', '<th>Attempts</th>'],
  ['<th>Risque</th>', '<th>Risk</th>'],
  ["d.risk === 'Élevé'", "d.risk === 'High'"],
  ["d.risk === 'Modéré'", "d.risk === 'Moderate'"],
  ["{{ d.risk === 'Élevé' ? '⚖️' : '📞' }}", "{{ d.risk === 'High' ? '⚖️' : '📞' }}"],
  ["{{ d.risk === 'Élevé' ? 'Contentieux' : 'Relancer' }}", "{{ d.risk === 'High' ? 'Legal' : 'Follow up' }}"],
  ['<button class="btn btn-outline btn-xs">Dossier</button>', '<button class="btn btn-outline btn-xs">File</button>'],
  ['Gestion des clients', 'Client management'],
  ['Base clients', 'Client database'],
  ['1 248 clients · 23 nouveaux ce mois · 3 suspendus', '1,248 clients · 23 new this month · 3 suspended'],
  ['+ Nouveau client', '+ New client'],
  ['Score moyen :', 'Average score:'],
  ['Dossiers incomplets', 'Incomplete files'],
  ['KYC complété :', 'KYC completed:'],
  ['Raison : <b>Défauts répétés</b>', 'Reason: <b>Repeated defaults</b>'],
  ['résultats', 'results'],
  ['<th>Encours</th>', '<th>Outstanding</th>'],
  ['<th>Crédits</th>', '<th>Credits</th>'],
  ['<button class="btn btn-ghost btn-xs">Voir</button>', '<button class="btn btn-ghost btn-xs">View</button>'],
  ['Suivi financier', 'Financial tracking'],
  ['Collecte mensuelle : 487 200 TND · Taux de recouvrement : 98.2%', 'Monthly collection: 487,200 TND · Recovery rate: 98.2%'],
  ['+ Saisir paiement', '+ Record payment'],
  ['Collecté ce mois', 'Collected this month'],
  ['Objectif :', 'Target:'],
  ['12 cas', '12 cases'],
  ['Impayés totaux', 'Total delinquent amount'],
  ['A venir', 'Upcoming'],
  ['Echeances Mars', 'March due dates'],
  ['Prochaine : <b>05 Mars 2026</b>', 'Next: <b>Mar 5, 2026</b>'],
  ['Contrats suivis', 'Contracts monitored'],
  ['Automatises :', 'Automated:'],
  ['Historique des remboursements &mdash; Fev 2026', 'Repayment history — Feb 2026'],
  ['<option>Fevrier 2026</option>', '<option>February 2026</option>'],
  ['<option>Janvier 2026</option>', '<option>January 2026</option>'],
  ['<option>Decembre 2025</option>', '<option>December 2025</option>'],
  ['<button class="btn btn-outline btn-sm">Filtres</button>', '<button class="btn btn-outline btn-sm">Filters</button>'],
  ['<th>Montant</th>', '<th>Amount</th>'],
  ['<th>Statut</th>', '<th>Status</th>'],
  ['Demandes de réservation', 'Reservation requests'],
  ['Analyse des risques', 'Risk analysis'],
  ['3 alertes critiques · Taux de défaut global 1.8%', '3 critical alerts · Overall default rate 1.8%'],
  ['Alertes risque élevé', 'High-risk alerts'],
  ['3 critiques', '3 critical'],
  ['<th>Motif</th>', '<th>Reason</th>'],
  ['Distribution des scores', 'Score distribution'],
  ['Centre de notifications', 'Notification center'],
  ['7 non lues · 3 critiques', '7 unread · 3 critical'],
  ['Tout marquer lu', 'Mark all as read'],
  ['Alertes critiques', 'Critical alerts'],
  ['{{ unreadCriticalCount }} non lues', '{{ unreadCriticalCount }} unread'],
  ['Activité récente', 'Recent activity'],
  ['Analyse & rapports', 'Analysis & reports'],
  ['Générez et exportez vos rapports périodiques', 'Generate and export your periodic reports'],
  ['+ Générer rapport', '+ Generate report'],
  ['Rapports disponibles', 'Available reports'],
  ['Configuration système, utilisateurs et règles métier', 'System configuration, users, and business rules'],
  ['Sauvegarder la configuration', 'Save configuration'],
  ['Navigation paramètres', 'Settings navigation'],
  ['<button class="sn-item active">Général</button>', '<button class="sn-item active">General</button>'],
  ['<button class="sn-item">Utilisateurs & Rôles</button>', '<button class="sn-item">Users & roles</button>'],
  ['<button class="sn-item">Règles métier</button>', '<button class="sn-item">Business rules</button>'],
  ['<button class="sn-item">Sécurité</button>', '<button class="sn-item">Security</button>'],
  ['<button class="sn-item">Sauvegarde</button>', '<button class="sn-item">Backup</button>'],
  ['<button class="sn-item">Intégrations</button>', '<button class="sn-item">Integrations</button>'],
  ['Paramètres généraux', 'General settings'],
  ['Formulaires de configuration', 'Configuration forms'],
  ["Nom de l'institution", 'Institution name'],
  ["FIN'IX — Crédit & Assurance", "FIN'IX — Credit & insurance"],
  ['Identifiant fiscal', 'Tax ID'],
  ['Devise', 'Currency'],
  ['TND — Dinar Tunisien', 'TND — Tunisian dinar'],
  ['Fuseau horaire', 'Time zone'],
  ['Règles de scoring', 'Scoring rules'],
  ['Score min. approbation auto', 'Min. score for auto-approval'],
  ['Score min. dossier standard', 'Min. score for standard file'],
  ['Taux endettement max (%)', 'Max debt-to-income ratio (%)'],
  ['Montant max non garanti (TND)', 'Max unsecured amount (TND)'],
  ['Notifications automatiques', 'Automatic notifications'],
  ['Alertes impayés', 'Delinquency alerts'],
  ['Envoyer SMS au client dès le J+1 de retard', 'Send SMS to the client from day 1 past due'],
  ['Rappels renouvellement assurance', 'Insurance renewal reminders'],
  ['Notifier 30 jours avant expiration', 'Notify 30 days before expiry'],
  ['Rapport mensuel automatique', 'Automatic monthly report'],
  ['Générer et envoyer le rapport le 1er du mois', 'Generate and send the report on the 1st of each month'],
  ['Utilisateurs système', 'System users'],
  ['+ Ajouter utilisateur', '+ Add user'],
  ['<th>Utilisateur</th>', '<th>User</th>'],
  ['<th>Rôle</th>', '<th>Role</th>'],
  ['Dernière connexion', 'Last login'],
  ['<button class="btn btn-ghost btn-xs">Modifier</button>', '<button class="btn btn-ghost btn-xs">Edit</button>'],
];

for (const [from, to] of pairs) {
  if (!s.includes(from)) {
    console.warn('Not found:', JSON.stringify(from).slice(0, 100));
    continue;
  }
  s = s.split(from).join(to);
}

const paymentBlockOld = `              <td>
                  <span class="badge"
                        [ngClass]="{
                      'b-blue':   p.mode==='Transfer'    || p.mode==='Virement',
                      'b-purple': p.mode==='Direct Debit'|| p.mode==='Prelevement',
                      'b-teal':   p.mode==='Cash'        || p.mode==='Especes'
                    }">
                    {{ p.mode === 'Transfer' ? 'Virement' :
                    p.mode === 'Direct Debit' ? 'Prelevement' :
                      p.mode === 'Cash' ? 'Especes' : (p.mode || '—') }}
                  </span>
              </td>
              <td>
                  <span *ngIf="p.status==='Paid' || p.status==='Paye'" class="badge b-actif">
                    v Paye
                  </span>
                <span *ngIf="p.status==='Pending' || p.status==='En attente'" class="badge b-review">
                    En attente
                  </span>
                <span *ngIf="p.status!=='Paid' && p.status!=='Paye' && p.status!=='Pending' && p.status!=='En attente'" class="badge b-danger">
                    X Impaye
                  </span>
              </td>
              <td style="font-size:.75rem;color:var(--g500);">{{ p.agent }}</td>
              <td>
                <div style="display:flex;gap:.375rem;" *ngIf="p.status==='Pending' || p.status==='En attente'">
                  <button class="btn btn-primary btn-xs">Saisir</button>
                  <button class="btn btn-outline btn-xs">Relancer</button>
                </div>
                <button *ngIf="p.status==='Paid' || p.status==='Paye'" class="btn btn-ghost btn-xs">Recu</button>
              </td>`;

const paymentBlockNew = `              <td>
                  <span class="badge"
                        [ngClass]="{
                      'b-blue':   p.mode==='Transfer'    || p.mode==='Virement',
                      'b-purple': p.mode==='Direct Debit'|| p.mode==='Prelevement',
                      'b-teal':   p.mode==='Cash'        || p.mode==='Especes'
                    }">
                    {{ p.mode === 'Transfer' || p.mode === 'Virement' ? 'Transfer' :
                    p.mode === 'Direct Debit' || p.mode === 'Prelevement' ? 'Direct debit' :
                      p.mode === 'Cash' || p.mode === 'Especes' ? 'Cash' : (p.mode || '—') }}
                  </span>
              </td>
              <td>
                  <span *ngIf="p.status==='Paid' || p.status==='Paye'" class="badge b-actif">
                    ✓ Paid
                  </span>
                <span *ngIf="p.status==='Pending' || p.status==='En attente'" class="badge b-review">
                    Pending
                  </span>
                <span *ngIf="p.status!=='Paid' && p.status!=='Paye' && p.status!=='Pending' && p.status!=='En attente'" class="badge b-danger">
                    ✗ Unpaid
                  </span>
              </td>
              <td style="font-size:.75rem;color:var(--g500);">{{ p.agent }}</td>
              <td>
                <div style="display:flex;gap:.375rem;" *ngIf="p.status==='Pending' || p.status==='En attente'">
                  <button class="btn btn-primary btn-xs">Record</button>
                  <button class="btn btn-outline btn-xs">Remind</button>
                </div>
                <button *ngIf="p.status==='Paid' || p.status==='Paye'" class="btn btn-ghost btn-xs">Receipt</button>
              </td>`;

if (!s.includes(paymentBlockOld)) {
  console.error('Payment block pattern mismatch — abort write');
  process.exit(1);
}
s = s.split(paymentBlockOld).join(paymentBlockNew);

/** Titles that share the word with routes: replace remaining standalone UI labels */
const late = [
  ['<div class="ph-title">Remboursements</div>', '<div class="ph-title">Repayments</div>'],
  ['<div class="ph-title">Risque & Score</div>', '<div class="ph-title">Risk & score</div>'],
  ['<div class="ph-title">Alertes & Notifs</div>', '<div class="ph-title">Alerts & notifications</div>'],
  ['<div class="ph-title">Rapports</div>', '<div class="ph-title">Reports</div>'],
  ['<div class="ph-title">Paramètres</div>', '<div class="ph-title">Settings</div>'],
];
for (const [from, to] of late) {
  if (s.includes(from)) s = s.split(from).join(to);
}

fs.writeFileSync(file, s);
console.log('OK', file);
