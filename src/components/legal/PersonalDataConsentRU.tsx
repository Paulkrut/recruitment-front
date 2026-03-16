import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  ContactSupport,
  Gavel,
  Info,
  PrivacyTip,
  Security,
  Warning,
} from "@mui/icons-material";
import Link from "next/link";

export default function PersonalDataConsentRU() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <PrivacyTip sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Согласие на обработку персональных данных
          </Typography>
          <Typography variant="h6" color="text.secondary">
            для использования платформы SofiHR и бесплатных HR-инструментов
          </Typography>
          <Chip label="Обновлено: 16.03.2026" color="primary" sx={{ mt: 2 }} />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: "middle" }} />
            1. Подтверждение согласия
          </Typography>
          <Typography variant="body1" paragraph>
            Проставляя галочку, нажимая кнопку запуска инструмента, отправки формы,
            загрузки файла либо продолжая использование сервиса в случаях,
            когда интерфейс прямо указывает на необходимость такого согласия,
            вы свободно, своей волей и в своем интересе выражаете согласие на
            обработку ваших персональных данных оператором сервиса SofiHR.
          </Typography>
          <Typography variant="body1" paragraph>
            Согласие предоставляется в соответствии с Федеральным законом от
            27.07.2006 № 152-ФЗ «О персональных данных».
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: "middle" }} />
            2. Какие данные могут обрабатываться
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Текстовые данные"
                secondary="ФИО, должности, резюме, описания вакансий, ответы, деловая переписка, текст документов и иная информация, введенная пользователем в формы"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Файлы, загружаемые пользователем"
                secondary="Аудио, видео, документы и иные материалы, переданные для транскрибации, анализа или генерации результата"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Технические метаданные"
                secondary="IP-адрес, user-agent, referer, дата и время обращения, а также для отдельных инструментов: имя файла, размер и расширение"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Security sx={{ mr: 1, verticalAlign: "middle" }} />
            3. Цели обработки
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Предоставление функциональности платформы и бесплатных HR-инструментов"
                secondary="Генерация текстов, документов, оценок, аналитики, инструкций и других результатов"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Распознавание речи и обработка файлов"
                secondary="Транскрибация аудио и видео, улучшение и форматирование текста"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText
                primary="Техническое сопровождение и безопасность сервиса"
                secondary="Логирование метаданных, защита от злоупотреблений, диагностика ошибок и контроль работоспособности"
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
            4. Передача данных российским технологическим партнерам
          </Typography>
          <Typography variant="body1" paragraph>
            Я уведомлен(а) и соглашаюсь, что для предоставления результата
            оператор вправе поручать обработку данных российским технологическим
            партнерам и подрядчикам, предоставляющим инфраструктурные,
            речевые, AI/LLM и иные связанные сервисы, при условии, что такая
            обработка осуществляется на территории Российской Федерации либо в
            соответствии с требованиями законодательства РФ.
          </Typography>
          <Typography variant="body1" paragraph>
            Конкретный поставщик может меняться без отдельного уведомления,
            если цель обработки, состав передаваемых данных и требования
            безопасности остаются сопоставимыми и законными.
          </Typography>
          <Alert severity="info">
            Полный перечень актуальных технологических партнеров и применимых
            категорий обработки может предоставляться по запросу пользователя
            или закрепляться во внутренних документах оператора и договорах с
            обработчиками.
          </Alert>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: "middle" }} />
            5. Особые условия для файлов и транскрибации
          </Typography>
          <Typography variant="body1" paragraph>
            Загружая файл, пользователь подтверждает, что имеет законные
            основания на передачу содержащихся в нем данных оператору и его
            технологическим партнерам для достижения заявленной цели обработки.
          </Typography>
          <Typography variant="body1" paragraph>
            Для транскрибации и улучшения текста содержимое файла может
            обрабатываться автоматизированными средствами, включая модели
            распознавания речи и языковые модели.
          </Typography>
          <Typography variant="body1" paragraph>
            Содержимое файлов и результатов, переданных через бесплатные
            HR-инструменты, по общему правилу не предназначено для постоянного
            хранения оператором, однако может временно находиться в оперативной
            обработке, технических очередях, временных файлах и журналах, если
            это необходимо для выполнения запроса, обеспечения безопасности или
            расследования сбоев.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Gavel sx={{ mr: 1, verticalAlign: "middle" }} />
            6. Действия с персональными данными
          </Typography>
          <Typography variant="body1" paragraph>
            Я даю согласие на следующие действия с персональными данными:
            сбор, запись, систематизация, накопление, хранение, уточнение,
            извлечение, использование, передача (предоставление, доступ),
            обезличивание, блокирование, удаление и уничтожение, включая
            автоматизированную обработку.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Info sx={{ mr: 1, verticalAlign: "middle" }} />
            7. Срок действия согласия
          </Typography>
          <Typography variant="body1" paragraph>
            Согласие действует с момента его предоставления до достижения целей
            обработки либо до момента его отзыва, если более длительный срок не
            требуется по закону или для защиты прав оператора.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
            8. Отзыв согласия
          </Typography>
          <Typography variant="body1" paragraph>
            Согласие может быть отозвано путем направления обращения оператору
            по адресу: info@sofihr.ru. Отзыв не влияет на законность обработки,
            осуществленной до момента его получения оператором.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            <ContactSupport sx={{ mr: 1, verticalAlign: "middle" }} />
            9. Контакты оператора
          </Typography>
          <Typography variant="body1" paragraph>
            Оператор: ИП Филипенко Анна Евгеньевна, ОГРНИП 324774600106007,
            ИНН 772154932804.
          </Typography>
          <Typography variant="body1" paragraph>
            Email по вопросам персональных данных: info@sofihr.ru
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mt: 4 }}>
          Не загружайте в бесплатные инструменты избыточные персональные данные,
          специальные категории данных и иные сведения, если это не требуется
          для получения результата и у вас нет законного основания на их
          передачу.
        </Alert>

        <Box textAlign="center" mt={4}>
          <Button variant="contained" color="primary" size="large" component={Link} href="/" sx={{ mr: 2 }}>
            Вернуться на главную
          </Button>
          <Button variant="outlined" color="primary" size="large" component={Link} href="/privacy-policy" sx={{ mr: 2 }}>
            Политика конфиденциальности
          </Button>
          <Button variant="outlined" color="primary" size="large" component={Link} href="/terms-of-service">
            Оферта
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
