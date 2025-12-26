# 📤 Массовая отправка приглашений - ИНСТРУКЦИЯ ПО ЗАВЕРШЕНИЮ

## ✅ ЧТО УЖЕ СДЕЛАНО (Backend - 100%)

### 1. База данных
```sql
ALTER TABLE hh_candidate 
ADD interview_invitation_sent_at DATETIME DEFAULT NULL,
ADD interview_invitation_sent_by_id INT DEFAULT NULL;
```

**Применить миграцию:**
```bash
cd C:\laragon\www\recruitment
php bin/console doctrine:migrations:migrate
```

### 2. Backend API
- ✅ `POST /api/hh-integration/vacancy/{vacancyId}/send-bulk-invitations`
- ✅ Автосохранение даты отправки в единичной отправке
- ✅ Добавлены поля в API ответы: `hhCandidateId`, `invitationSentAt`, `invitationSentBy`

### 3. Frontend BulkActionsPanel
- ✅ Добавлена кнопка "📤 Отправить приглашения"
- ✅ Props готовы для подключения

---

## ⏳ ЧТО ОСТАЛОСЬ СДЕЛАТЬ (Frontend)

### Шаг 1: Подключить BulkActionsPanel к KanbanView.tsx

**Файл:** `recruitment-front/src/app/(DashboardLayout)/hr/vacancies/[id]/KanbanView.tsx`

**Что добавить:**

1. **Импорты:**
```typescript
import { apiFetch } from "@/utils/api";
const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";
```

2. **State для диалога:**
```typescript
const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
const [sendingInvitations, setSendingInvitations] = useState(false);
const [invitationResults, setInvitationResults] = useState<any>(null);
```

3. **Функция массовой отправки:**
```typescript
const handleBulkSendInvitations = async () => {
  if (selectedCards.length === 0) return;
  
  // Фильтруем только HH кандидатов
  const hhCandidates = selectedCards.filter(c => candidates.find(cand => cand.id === c && cand.hhCandidateId));
  
  if (hhCandidates.length === 0) {
    setSnackbar(_(msg`Нет кандидатов из HH.ru`));
    return;
  }
  
  // Проверяем сколько уже получали приглашения
  const alreadyInvited = hhCandidates.filter(c => {
    const cand = candidates.find(ca => ca.id === c);
    return cand?.invitationSentAt;
  });
  
  // Показываем диалог подтверждения
  setInvitationDialogOpen(true);
};

const confirmSendInvitations = async () => {
  setSendingInvitations(true);
  
  try {
    const hhCandidateIds = selectedCards
      .map(id => candidates.find(c => c.id === id))
      .filter(c => c?.hhCandidateId)
      .map(c => c!.hhCandidateId);
    
    const res = await apiFetch(`${API_BASE}/api/hh-integration/vacancy/${vacancyId}/send-bulk-invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateIds: hhCandidateIds })
    });
    
    if (res.ok) {
      const data = await res.json();
      setInvitationResults(data);
      setSnackbar(_(msg`✅ Отправлено: ${data.sent} / ${data.total}`));
      
      // Перезагружаем кандидатов
      await refetchCandidates();
      
      // Снимаем выделение
      setSelectedCards([]);
    } else {
      setSnackbar(_(msg`❌ Ошибка отправки приглашений`));
    }
  } catch (error) {
    console.error('Error sending invitations:', error);
    setSnackbar(_(msg`❌ Ошибка отправки приглашений`));
  } finally {
    setSendingInvitations(false);
    setInvitationDialogOpen(false);
  }
};
```

4. **Передать в BulkActionsPanel:**
```typescript
<BulkActionsPanel
  selectedCount={selectedCards.length}
  selectedAllInColumns={selectedAllInColumns}
  onCancel={handleCancelSelection}
  onBulkMove={handleBulkMove}
  onBulkSendInvitations={handleBulkSendInvitations}  // ← ДОБАВИТЬ
  vacancySource={vacancyData?.source}                // ← ДОБАВИТЬ
  selectedCandidates={selectedCards.map(id =>        // ← ДОБАВИТЬ
    candidates.find(c => c.id === id)
  ).filter(Boolean)}
  statusTriggers={statusTriggers}
  hhLimits={hhLimits}
  resumeQueueCount={resumeQueueCount}
/>
```

5. **Диалог подтверждения:**
```typescript
<Dialog open={invitationDialogOpen} onClose={() => !sendingInvitations && setInvitationDialogOpen(false)}>
  <DialogTitle>
    <Trans>Отправить приглашения в HH.ru?</Trans>
  </DialogTitle>
  <DialogContent>
    <Typography>
      <Trans>Будет отправлено приглашений:</Trans> <strong>{selectedCards.filter(c => {
        const cand = candidates.find(ca => ca.id === c);
        return cand?.hhCandidateId;
      }).length}</strong>
    </Typography>
    
    {selectedCards.filter(c => {
      const cand = candidates.find(ca => ca.id === c);
      return cand?.invitationSentAt;
    }).length > 0 && (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Trans>
          ⚠️ {selectedCards.filter(c => {
            const cand = candidates.find(ca => ca.id === c);
            return cand?.invitationSentAt;
          }).length} кандидатов уже получали приглашение ранее. Отправить повторно?
        </Trans>
      </Alert>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setInvitationDialogOpen(false)} disabled={sendingInvitations}>
      <Trans>Отмена</Trans>
    </Button>
    <Button onClick={confirmSendInvitations} variant="contained" disabled={sendingInvitations}>
      {sendingInvitations ? <Trans>Отправка...</Trans> : <Trans>Отправить</Trans>}
    </Button>
  </DialogActions>
</Dialog>
```

---

### Шаг 2: То же самое для CandidatesList.tsx

**Файл:** `recruitment-front/src/app/(DashboardLayout)/hr/vacancies/[id]/CandidatesList.tsx`

Повторить те же шаги что и для KanbanView.tsx.

---

### Шаг 3: Добавить визуальные индикаторы (badges)

**В KanbanView.tsx и CandidatesList.tsx:**

В карточке кандидата добавить:

```typescript
{candidate.invitationSentAt && (
  <Tooltip title={_(msg`Приглашение отправлено ${formatDate(candidate.invitationSentAt)} (${candidate.invitationSentBy})`)}>
    <Chip 
      icon={<MailOutlineIcon fontSize="small" />}
      label={_(msg`✉️ Приглашён`)}
      size="small"
      color="success"
      variant="outlined"
      sx={{ fontSize: 10 }}
    />
  </Tooltip>
)}
```

---

### Шаг 4: Добавить фильтры

**В CandidateFilters.tsx:**

```typescript
<FormControlLabel
  control={
    <Checkbox 
      checked={filters.invitationSent === true}
      onChange={(e) => handleFilterChange('invitationSent', e.target.checked ? true : null)}
    />
  }
  label={_(msg`✉️ Приглашение отправлено`)}
/>

<FormControlLabel
  control={
    <Checkbox 
      checked={filters.invitationSent === false}
      onChange={(e) => handleFilterChange('invitationSent', e.target.checked ? false : null)}
    />
  }
  label={_(msg`📭 Без приглашения`)}
/>
```

**В Backend (AdminVacancyController.php::candidatesKanban):**

Добавить фильтр:

```php
// Фильтр по отправленным приглашениям
$invitationSent = $request->query->get('invitationSent');
if ($invitationSent === 'true') {
    $qb->leftJoin('c.hhCandidate', 'hc2')
       ->andWhere('hc2.interviewInvitationSentAt IS NOT NULL');
} elseif ($invitationSent === 'false') {
    $qb->leftJoin('c.hhCandidate', 'hc3')
       ->andWhere('(hc3.interviewInvitationSentAt IS NULL OR hc3.id IS NULL)');
}
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 1. Применить миграцию:
```bash
cd C:\laragon\www\recruitment
php bin/console doctrine:migrations:migrate
```

### 2. Проверить в канбане:
- Выбрать несколько HH кандидатов
- Нажать кнопку "📤 Отправить приглашения"
- Проверить что приглашения отправились
- Проверить что появились badges "✉️ Приглашён"

### 3. Проверить фильтры:
- Включить фильтр "✉️ Приглашение отправлено"
- Убедиться что показываются только приглашённые
- Включить фильтр "📭 Без приглашения"
- Убедиться что показываются только не приглашённые

---

## 📊 ТЕКУЩИЙ СТАТУС

- ✅ **Backend**: 100%
- 🔄 **Frontend**: 40%
  - ✅ BulkActionsPanel обновлен
  - ⏳ Подключение к страницам
  - ⏳ Визуальные индикаторы
  - ⏳ Фильтры
  
**Осталось:** ~2-3 часа работы на фронтенд





