"use client";
import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Chip, Alert, Button, Grid
} from '@mui/material';
import {
  Description, Gavel, CheckCircle, Warning, Info, 
  Security, Business, People, DataUsage, DeleteForever, ContactSupport
} from '@mui/icons-material';
import Link from 'next/link';

export default function HrAgreementPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Заголовок */}
        <Box textAlign="center" mb={4}>
          <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Публичная оферта для HR-клиентов
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Условия использования платформы SofiHR для HR-организаций
          </Typography>
          <Chip 
            label="Обновлено: 15.01.2025" 
            color="primary" 
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Общие положения */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            1. Общие положения
          </Typography>
          <Typography variant="body1" paragraph>
            Настоящая публичная оферта (далее — «Оферта») определяет условия использования 
            платформы SofiHR для HR-специалистов и организаций, независимо от их 
            организационно-правовой формы.
          </Typography>
          <Typography variant="body1" paragraph>
            Используя платформу SofiHR, клиент (физическое или юридическое лицо) принимает 
            настоящую Оферту и соглашается следовать её условиям.
          </Typography>
        </Box>

        {/* Определения */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            2. Определения
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Платформа SofiHR"
                secondary="Веб-приложение для подбора персонала, предоставляющее HR-услуги"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><People color="primary" /></ListItemIcon>
              <ListItemText 
                primary="HR-клиент"
                secondary="Физическое или юридическое лицо, использующее платформу для подбора персонала"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><People color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Кандидат"
                secondary="Физическое лицо, проходящее интервью на платформе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DataUsage color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Персональные данные"
                secondary="Информация о кандидатах, обрабатываемая на платформе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Организация"
                secondary="Юридическое лицо, к которому может быть привязан HR-клиент"
              />
            </ListItem>
          </List>
        </Box>

        {/* Типы HR-клиентов */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <People sx={{ mr: 1, verticalAlign: 'middle' }} />
            3. Типы HR-клиентов и их ответственность
          </Typography>
          <Typography variant="body1" paragraph>
            Платформа SofiHR поддерживает работу с разными типами HR-клиентов:
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Физическое лицо (HR-специалист):
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Личная ответственность"
                secondary="Полная ответственность за соблюдение 152-ФЗ"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Индивидуальная обработка"
                secondary="Обработка ПД от своего имени"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Возможность привязки к организации"
                secondary="Можно добавить информацию об организации позже"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Юридическое лицо (организация):
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративная ответственность"
                secondary="Ответственность организации за соблюдение 152-ФЗ"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративная обработка"
                secondary="Обработка ПД от имени организации"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Назначение ответственного"
                secondary="Обязательное назначение ответственного за ПД"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Смешанный тип (HR-специалист + организация):
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Двойная ответственность"
                secondary="Личная + корпоративная ответственность"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Гибкие настройки"
                secondary="Можно работать как от своего имени, так и от организации"
              />
            </ListItem>
          </List>
        </Box>

        {/* Обязательства HR-клиента */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            4. Обязательства HR-клиента
          </Typography>
          <Typography variant="body1" paragraph>
            Независимо от типа клиента, HR-клиент обязуется:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Соблюдать законодательство о персональных данных"
                secondary="152-ФЗ и другие нормативные акты"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Использовать данные кандидатов только по назначению"
                secondary="Исключительно для принятия решений о найме"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Не передавать данные третьим лицам"
                secondary="Без согласия кандидата или требования закона"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Обеспечивать безопасность данных"
                secondary="Технические и организационные меры защиты"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Соблюдать сроки хранения данных"
                secondary="Не дольше, чем необходимо для целей обработки"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Реализовывать права кандидатов"
                secondary="Обрабатывать запросы на отзыв, исправление и т.д."
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Важно:</strong> При привязке к организации HR-специалист также обязуется 
              соблюдать внутренние политики организации по защите персональных данных.
            </Typography>
          </Alert>
        </Box>

        {/* Обработка персональных данных */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            5. Обработка персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            HR-клиент является оператором персональных данных кандидатов и несет 
            ответственность за их обработку согласно 152-ФЗ.
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Цели обработки данных:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Оценка кандидата"
                secondary="Анализ результатов интервью и тестирования"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Принятие решения о найме"
                secondary="Выбор наиболее подходящего кандидата"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Ведение кадрового учета"
                secondary="При найме кандидата на работу"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Сроки хранения данных:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="При отказе в найме"
                secondary="1 год после принятия решения"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="При найме на работу"
                secondary="Согласно трудовому законодательству"
              />
            </ListItem>
          </List>
        </Box>

        {/* Права кандидатов */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            6. Права кандидатов
          </Typography>
          <Typography variant="body1" paragraph>
            HR-клиент обязан обеспечить реализацию прав кандидатов:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на информацию"
                secondary="Узнать о целях и способах обработки данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на доступ"
                secondary="Получить копию обрабатываемых данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на исправление"
                secondary="Исправить неточные данные"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на удаление"
                secondary="Требовать удаления данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на отзыв согласия"
                secondary="Запрос на удаление данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><DeleteForever color="primary" /></ListItemIcon>
              <ListItemText
                primary="Право на забвение"
                secondary="Полное удаление персональных данных"
              />
            </ListItem>
          </List>
        </Box>

        {/* Привязка к организации */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. Привязка HR-специалиста к организации
          </Typography>
          <Typography variant="body1" paragraph>
            HR-специалист может привязать свой аккаунт к организации для расширения 
            функциональности и корпоративной работы.
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Возможности при привязке к организации:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративные вакансии"
                secondary="Создание вакансий от имени организации"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративный брендинг"
                secondary="Использование логотипа и стиля организации"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративная отчетность"
                secondary="Аналитика по подбору персонала"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративные настройки"
                secondary="Общие настройки для всех HR-специалистов организации"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Обязательства при привязке к организации:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Соблюдение корпоративных политик"
                secondary="Следование внутренним правилам организации"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Корпоративная ответственность"
                secondary="Ответственность за действия от имени организации"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Согласование действий"
                secondary="Согласование важных решений с руководством"
              />
            </ListItem>
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Внимание:</strong> При привязке к организации HR-специалист принимает 
              на себя дополнительную ответственность за соблюдение корпоративных требований 
              по защите персональных данных.
            </Typography>
          </Alert>
        </Box>

        {/* Ответственность */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Ответственность сторон
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Ответственность платформы SofiHR:</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Предоставление платформы"
                secondary="Техническая поддержка и обновления"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Безопасность данных на платформе"
                secondary="Защита при передаче и хранении"
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            <strong>Ответственность HR-клиента:</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Соблюдение 152-ФЗ"
                secondary="Полная ответственность за обработку ПД кандидатов"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Безопасность данных"
                secondary="Защита копий данных, полученных от платформы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Реализация прав кандидатов"
                secondary="Обработка запросов на удаление, исправление и т.д."
              />
            </ListItem>
          </List>
        </Box>

        {/* Изменения оферты */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. Изменения оферты
          </Typography>
          <Typography variant="body1" paragraph>
            Платформа SofiHR оставляет за собой право изменять условия оферты:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="При изменении законодательства"
                secondary="Адаптация к новым требованиям 152-ФЗ"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="При развитии платформы"
                secondary="Добавление новых функций и возможностей"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="При изменении бизнес-модели"
                secondary="Корректировка условий использования"
              />
            </ListItem>
          </List>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Уведомление:</strong> Об изменениях оферты HR-клиенты будут уведомлены 
              через платформу не менее чем за 30 дней до вступления изменений в силу.
            </Typography>
          </Alert>
        </Box>

        {/* Контакты */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            10. Контактная информация
          </Typography>
          <Typography variant="body1" paragraph>
            По всем вопросам, связанным с настоящей офертой:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.ru"
                secondary="Юридические вопросы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.ru"
                secondary="Техническая поддержка"
              />
            </ListItem>
          </List>
        </Box>

        {/* Заключение */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. Заключительные положения
          </Typography>
          <Typography variant="body1" paragraph>
            Настоящая оферта вступает в силу с момента размещения на платформе и действует 
            до момента её отмены или замены новой офертой.
          </Typography>
          <Typography variant="body1" paragraph>
            Используя платформу SofiHR, HR-клиент подтверждает, что ознакомился с настоящей 
            офертой и согласен следовать её условиям.
          </Typography>
        </Box>

        {/* Кнопки действий */}
        <Box textAlign="center" mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={Link}
            href="/"
            sx={{ mr: 2 }}
          >
            Вернуться на главную
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={Link}
            href="/privacy-policy"
          >
            Политика конфиденциальности
          </Button>
        </Box>

        {/* Предупреждение */}
        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Важно:</strong> Настоящая оферта является юридическим документом. 
            При возникновении вопросов обращайтесь к нам для получения разъяснений.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
} 