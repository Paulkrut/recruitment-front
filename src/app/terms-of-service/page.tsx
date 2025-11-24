"use client";
import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Chip, Alert, Button
} from '@mui/material';
import {
  Description, Gavel, CheckCircle, Warning, Info, 
  Security, ContactSupport, Business, DeleteForever
} from '@mui/icons-material';
import Link from 'next/link';
import { useLingui, Trans } from '@lingui/react';
import { msg } from '@lingui/macro';


export default function TermsOfServicePage() {
  const { _ } = useLingui();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Заголовок */}
        <Box textAlign="center" mb={4}>
          <Description sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold"><Trans>Условия использования</Trans></Typography>
          <Typography variant="h6" color="text.secondary"><Trans>Система подбора персонала SofiHR</Trans></Typography>
          <Chip 
            label={_(msg`Обновлено: 22.09.2025`)} 
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
          <Typography variant="body1" paragraph><Trans>Настоящие Условия использования (далее — «Условия») регулируют порядок использования 
            системы подбора персонала SofiHR (далее — «Система») и определяют права и обязанности 
            пользователей.</Trans></Typography>
          <Typography variant="body1" paragraph><Trans>Используя Систему, вы принимаете настоящие Условия и соглашаетесь следовать им.</Trans></Typography>
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
                secondary="Веб-приложение для подбора персонала, предоставляющее услуги HR-клиентам"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="HR-клиент"
                secondary="Организация, использующая платформу для подбора персонала"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Кандидат"
                secondary="Пользователь, проходящий интервью или тестирование на платформе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Business color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Пользователь"
                secondary="Физическое лицо, использующее платформу (кандидат, HR-менеджер)"
              />
            </ListItem>
          </List>
        </Box>

        {/* Функциональность системы */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            3. Функциональность системы
          </Typography>
          <Typography variant="body1" paragraph><Trans>Система предоставляет следующие возможности:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Создание и управление вакансиями"
                secondary="Для HR-менеджеров"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Подача заявок на вакансии"
                secondary="Для кандидатов через публичные ссылки"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Проведение интервью"
                secondary="Видео и аудио интервью с записью"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Тестирование кандидатов"
                secondary="Оценка навыков и компетенций"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Сравнение кандидатов"
                secondary="AI-анализ и рейтингование"
              />
            </ListItem>
          </List>
        </Box>

        {/* Правила использования */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            4. Правила использования
          </Typography>
          <Typography variant="body1" paragraph><Trans>При использовании Системы запрещается:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Нарушать законодательство РФ"
                secondary="Использовать систему для незаконной деятельности"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Предоставлять ложную информацию"
                secondary="Указывать неверные данные о себе или других лицах"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Нарушать права других пользователей"
                secondary="Оскорбления, угрозы, дискриминация"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Пытаться обойти систему безопасности"
                secondary="Хакерские атаки, использование ботов"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Нарушать конфиденциальность"
                secondary="Передача данных третьим лицам без согласия"
              />
            </ListItem>
          </List>
        </Box>

        {/* Обязанности пользователей */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            5. Обязанности пользователей
          </Typography>
          <Typography variant="body1" paragraph><Trans>Пользователи обязаны:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Предоставлять достоверную информацию"
                secondary="Актуальные и правдивые данные о себе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Соблюдать конфиденциальность"
                secondary="Не разглашать информацию о других кандидатах"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Использовать систему по назначению"
                secondary="Только для подбора персонала"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Соблюдать технические требования"
                secondary="Стабильное интернет-соединение, современный браузер"
              />
            </ListItem>
          </List>
        </Box>

        {/* Ограничения ответственности */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            6. Ограничения ответственности
          </Typography>
          <Typography variant="body1" paragraph><Trans>Система предоставляется «как есть» без каких-либо гарантий:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Не гарантируется постоянная доступность"
                secondary="Возможны технические работы и перебои"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Не гарантируется точность результатов"
                secondary="AI-анализ может содержать неточности"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Не гарантируется трудоустройство"
                secondary="Система только помогает в подборе персонала"
              />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Важно:</strong> Система не несет ответственности за решения 
            HR-менеджеров о найме или отказе в трудоустройстве.
          </Alert>
        </Box>

        {/* Интеллектуальная собственность */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. Интеллектуальная собственность
          </Typography>
          <Typography variant="body1" paragraph><Trans>Все права на Систему принадлежат разработчикам:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Исходный код"
                secondary="Защищен авторскими правами"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Дизайн и интерфейс"
                secondary="Торговые марки и брендинг"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Алгоритмы и технологии"
                secondary="Патентованные решения"
              />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph><Trans>Пользователи не имеют права копировать, модифицировать или распространять 
            элементы Системы без разрешения.</Trans></Typography>
        </Box>

        {/* Конфиденциальность */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Конфиденциальность
          </Typography>
          <Typography variant="body1" paragraph><Trans>Система обеспечивает конфиденциальность данных:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Шифрование данных"
                secondary="Защита при передаче и хранении"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Ограничение доступа"
                secondary="Доступ только уполномоченным лицам"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Аудит действий"
                secondary="Логирование всех операций с данными"
              />
            </ListItem>
          </List>
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            Видео и аудио записи интервью используются исключительно для целей интервью и оценки соответствия вакансии и хранятся не более 60 календарных дней с даты завершения интервью. Подробно — в <Link href="/privacy-policy">Политике конфиденциальности</Link>.
          </Typography>
          <Typography variant="body1" paragraph>
            Подробная информация о защите персональных данных содержится в 
            <Link href="/privacy-policy" style={{ color: 'primary.main', textDecoration: 'none' }}>
              {' '}Политике конфиденциальности
            </Link>.
          </Typography>
        </Box>

        {/* Изменения условий */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. Изменения условий использования
          </Typography>
          <Typography variant="body1" paragraph><Trans>Мы оставляем за собой право изменять настоящие Условия:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Уведомление пользователей"
                secondary="Email уведомление об изменениях"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Обновление на сайте"
                secondary="Размещение новой версии условий"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Право отказаться"
                secondary="Возможность прекратить использование системы"
              />
            </ListItem>
          </List>
        </Box>

        {/* Прекращение использования */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            10. Прекращение использования
          </Typography>
          <Typography variant="body1" paragraph><Trans>Использование Системы может быть прекращено:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="По инициативе пользователя"
                secondary="Отзыв согласия на обработку ПД"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="При нарушении условий"
                secondary="Автоматическое прекращение доступа"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="По техническим причинам"
                secondary="Обновление или закрытие системы"
              />
            </ListItem>
          </List>
        </Box>

        {/* Применимое право */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. Применимое право
          </Typography>
          <Typography variant="body1" paragraph><Trans>Настоящие Условия регулируются законодательством Российской Федерации. 
            Все споры разрешаются в соответствии с российским правом.</Trans></Typography>
          <Typography variant="body1" paragraph><Trans>В случае возникновения разногласий стороны обязуются решать их путем переговоров. 
            При невозможности достижения соглашения спор разрешается в судебном порядке.</Trans></Typography>
        </Box>

        {/* Контакты */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            12. Контактная информация
          </Typography>
          <Typography variant="body1" paragraph><Trans>По всем вопросам, связанным с использованием Системы:</Trans></Typography>
          <List>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.ru"
                secondary="Техническая поддержка"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.ru"
                secondary="Юридические вопросы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Форма обратной связи"
                secondary="В системе"
              />
            </ListItem>
          </List>
        </Box>

        {/* Заключение */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            13. Заключительные положения
          </Typography>
          <Typography variant="body1" paragraph><Trans>Настоящие Условия вступают в силу с момента размещения на сайте и действуют 
            до момента их отмены или замены новыми Условиями.</Trans></Typography>
          <Typography variant="body1" paragraph><Trans>Используя Систему, вы подтверждаете, что ознакомились с настоящими Условиями 
            и согласны следовать им.</Trans></Typography>
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
          ><Trans>Вернуться на главную</Trans></Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={Link}
            href="/privacy-policy"
          ><Trans>Политика конфиденциальности</Trans></Button>
        </Box>

        {/* Предупреждение */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Важно:</strong> Данные условия использования составлены в соответствии 
            с российским законодательством. При возникновении вопросов обращайтесь к нам.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
} 