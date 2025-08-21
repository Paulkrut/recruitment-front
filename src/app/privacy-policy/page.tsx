"use client";
import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText,
  ListItemIcon, Chip, Alert, Button
} from '@mui/material';
import {
  Security, PrivacyTip, Gavel, Shield, ContactSupport, 
  CheckCircle, Warning, Info, Videocam, AccessTime, BusinessCenter, DeleteForever
} from '@mui/icons-material';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Заголовок */}
        <Box textAlign="center" mb={4}>
          <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Политика конфиденциальности
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Обработка персональных данных в системе подбора персонала
          </Typography>
          <Chip 
            label="Обновлено: 15.01.2025" 
            color="primary" 
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Основная информация */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            1. Общие положения
          </Typography>
          <Typography variant="body1" paragraph>
            Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
            персональных данных пользователей системы подбора персонала (далее — «Система») 
            в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ 
            «О персональных данных» (далее — «152-ФЗ»).
          </Typography>
          <Typography variant="body1" paragraph>
            Используя Систему, вы даете согласие на обработку ваших персональных данных 
            в соответствии с настоящей Политикой.
          </Typography>
        </Box>

        {/* Оператор ПД */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
            2. Оператор персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            Оператором персональных данных является компания, использующая Систему для подбора персонала.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Контактные данные оператора:</strong>
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email для вопросов по ПД: info@sofihr.ru"
                secondary="Время ответа: до 30 дней"
              />
            </ListItem>
          </List>
        </Box>

        {/* Цели обработки */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            3. Цели обработки персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            Ваши персональные данные обрабатываются исключительно в следующих целях:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Подбор персонала на вакантные должности"
                secondary="Оценка соответствия кандидата требованиям вакансии"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Проведение интервью и тестирования"
                secondary="Оценка профессиональных навыков и компетенций"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Формирование базы кандидатов"
                secondary="Хранение информации для будущих вакансий"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Предоставление обратной связи"
                secondary="Информирование о результатах оценки"
              />
            </ListItem>
          </List>
        </Box>

        {/* Категории ПД */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <PrivacyTip sx={{ mr: 1, verticalAlign: 'middle' }} />
            4. Категории обрабатываемых персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            Система обрабатывает следующие категории персональных данных:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Идентификационные данные"
                secondary="ФИО, дата рождения, контактная информация (телефон, email)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Профессиональные данные"
                secondary="Образование, опыт работы, навыки, результаты тестирования"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Warning color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Биометрические данные"
                secondary="Видео и аудио записи интервью (с вашего согласия)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Технические данные"
                secondary="IP-адрес, данные об устройстве, cookies"
              />
            </ListItem>
          </List>
        </Box>

        {/* Правовые основания */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            5. Правовые основания обработки
          </Typography>
          <Typography variant="body1" paragraph>
            Обработка персональных данных осуществляется на следующих основаниях:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Согласие субъекта персональных данных"
                secondary="Ваше явное согласие на обработку ПД"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Договор с субъектом ПД"
                secondary="В рамках трудовых или гражданско-правовых отношений"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Публичные источники"
                secondary="Данные, размещенные в публичном доступе"
              />
            </ListItem>
          </List>
        </Box>

        {/* Сроки хранения данных */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <AccessTime color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            7. Сроки хранения персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            Мы храним ваши персональные данные только в течение времени, необходимого 
            для достижения целей обработки, указанных в настоящей Политике.
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Конкретные сроки хранения:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Персональные данные кандидата"
                secondary="1 год после принятия решения о найме или отказе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Видео и аудио записи интервью"
                secondary="1 год после принятия решения о найме или отказе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Результаты анализа и оценки"
                secondary="1 год после принятия решения о найме или отказе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Согласия на обработку ПД"
                secondary="Хранятся в течение срока обработки данных + 3 года"
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            По истечении указанных сроков все персональные данные подлежат 
            автоматическому удалению или обезличиванию.
          </Typography>
        </Box>

        {/* Обработка видео и аудио данных */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Videocam color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            6. Обработка видео и аудио данных
          </Typography>
          <Typography variant="body1" paragraph>
            В процессе прохождения интервью система может записывать видео и аудио кандидата. 
            Важно понимать, что эти данные НЕ являются биометрическими персональными данными.
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Цели обработки видео и аудио данных:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Оценка коммуникативных навыков"
                secondary="Анализ мимики, жестов, манеры общения"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Анализ содержания ответов"
                secondary="Транскрипция и оценка качества ответов на вопросы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Принятие решения о найме"
                secondary="Комплексная оценка кандидата для HR-менеджера"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Важно:</strong> Видео и аудио записи НЕ используются для идентификации личности 
              и не передаются третьим лицам без вашего согласия.
            </Typography>
          </Alert>
        </Box>

        {/* Платформа-агрегатор */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <BusinessCenter color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. SofiHR как платформа-агрегатор
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Важно понимать:</strong> SofiHR является платформой-агрегатором, 
            предоставляющей услуги подбора персонала для HR-специалистов и организаций.
          </Typography>
          
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Типы HR-клиентов платформы:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="HR-специалисты (физические лица)"
                secondary="Индивидуальные пользователи платформы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Организации (юридические лица)"
                secondary="Корпоративные клиенты платформы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="HR-специалисты в организациях"
                secondary="Смешанный тип с привязкой к организации"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Как работает платформа:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="HR-клиенты размещают вакансии"
                secondary="От своего имени или от имени организации"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Кандидаты проходят интервью"
                secondary="На платформе с использованием наших технологий"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Результаты передаются HR-клиентам"
                secondary="Для принятия решений о найме"
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
            Двойная обработка данных:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="На платформе SofiHR"
                secondary="Для предоставления сервиса и анализа результатов"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="У HR-клиентов"
                secondary="Для принятия решений о найме согласно их политикам"
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Информация:</strong> После передачи данных HR-клиентам мы не контролируем, 
              как они обрабатывают ваши данные. Обращайтесь к HR-клиентам для реализации 
              своих прав в отношении данных, хранящихся у них.
            </Typography>
          </Alert>
        </Box>

        {/* Права субъектов ПД */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Ваши права как субъекта персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            В соответствии с Федеральным законом "О персональных данных" вы имеете следующие права:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на получение информации"
                secondary="Узнать, какие ваши данные обрабатываются и с какой целью"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на доступ к данным"
                secondary="Получить копию обрабатываемых персональных данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на исправление"
                secondary="Исправить неточные или неполные персональные данные"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на удаление"
                secondary="Требовать удаления персональных данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на отзыв согласия"
                secondary="Отозвать согласие на обработку данных в любое время"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Право на ограничение обработки"
                secondary="Ограничить обработку данных в определенных случаях"
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            Для реализации своих прав обращайтесь к нам через форму обратной связи 
            или по указанным контактным данным.
          </Typography>
        </Box>

        {/* Как реализовать права */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            8. Как реализовать свои права
          </Typography>
          <Typography variant="body1" paragraph>
            Для реализации своих прав вы можете:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Обратиться по email"
                secondary="info@sofihr.ru с указанием вашего запроса"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Использовать личный кабинет"
                secondary="Функции управления данными в системе"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Обратиться в службу поддержки"
                secondary="Через форму обратной связи в системе"
              />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Срок рассмотрения запроса:</strong> до 30 дней с момента получения обращения.
          </Alert>
        </Box>

        {/* Безопасность */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            9. Меры по защите персональных данных
          </Typography>
          <Typography variant="body1" paragraph>
            Для защиты ваших персональных данных применяются следующие меры:
          </Typography>
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
                primary="Контроль доступа"
                secondary="Ограничение доступа к ПД только уполномоченным лицам"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Мониторинг безопасности"
                secondary="Постоянный контроль за безопасностью системы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Регулярные обновления"
                secondary="Обновление системы безопасности"
              />
            </ListItem>
          </List>
        </Box>

        {/* Передача третьим лицам */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
            10. Передача персональных данных третьим лицам
          </Typography>
          <Typography variant="body1" paragraph>
            Ваши персональные данные НЕ передаются третьим лицам, за исключением случаев:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="С вашего явного согласия"
                secondary="Только при наличии письменного согласия"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="По требованию закона"
                secondary="В случаях, предусмотренных законодательством РФ"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Для защиты прав и безопасности"
                secondary="При угрозе безопасности или нарушении прав"
              />
            </ListItem>
          </List>
        </Box>

        {/* Cookies и аналитика */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            11. Cookies и аналитические данные
          </Typography>
          <Typography variant="body1" paragraph>
            Система использует cookies для:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Авторизации пользователей"
                secondary="Сохранение сессии и настроек"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Аналитики использования"
                secondary="Улучшение работы системы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText 
                primary="Безопасности"
                secondary="Защита от мошеннических действий"
              />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Важно:</strong> Вы можете отключить cookies в настройках браузера, 
            но это может повлиять на функциональность системы.
          </Alert>
        </Box>

        {/* Изменения в политике */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            12. Изменения в политике конфиденциальности
          </Typography>
          <Typography variant="body1" paragraph>
            Мы оставляем за собой право вносить изменения в настоящую Политику. 
            При внесении существенных изменений:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Уведомление пользователей"
                secondary="Email уведомление о изменениях"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Обновление даты"
                secondary="Указание новой даты вступления в силу"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Возможность отзыва согласия"
                secondary="Право отозвать согласие при несогласии с изменениями"
              />
            </ListItem>
          </List>
        </Box>

        {/* Контакты */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            13. Контактная информация
          </Typography>
          <Typography variant="body1" paragraph>
            По всем вопросам, связанным с обработкой персональных данных, обращайтесь:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email: info@sofihr.ru"
                secondary="Вопросы по защите персональных данных"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ContactSupport color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Служба поддержки"
                secondary="Через форму обратной связи в системе"
              />
            </ListItem>
          </List>
        </Box>

        {/* Заключение */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
            14. Заключительные положения
          </Typography>
          <Typography variant="body1" paragraph>
            Настоящая Политика вступает в силу с момента размещения на сайте и действует 
            до момента ее отмены или замены новой Политикой.
          </Typography>
          <Typography variant="body1" paragraph>
            Используя Систему, вы подтверждаете, что ознакомились с настоящей Политикой 
            и согласны с условиями обработки ваших персональных данных.
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
            href="/contact"
            sx={{ mr: 2 }}
          >
            Связаться с нами
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={Link}
            href="/forget-me"
            sx={{ mr: 2 }}
          >
            Запрос на удаление данных
          </Button>
          <Button 
            variant="outlined" 
            color="info" 
            size="large"
            component={Link}
            href="/hr-agreement"
          >
            Соглашение для HR-клиентов
          </Button>
        </Box>

        {/* Предупреждение */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Важно:</strong> Данная политика конфиденциальности составлена в соответствии 
            с требованиями российского законодательства. При возникновении вопросов или 
            необходимости реализации своих прав обращайтесь к нам.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
} 