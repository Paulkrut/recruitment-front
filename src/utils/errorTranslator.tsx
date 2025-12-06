// utils/errorTranslator.tsx
import { msg } from '@lingui/macro';
import { MessageDescriptor } from '@lingui/core';

/**
 * Получить LingUI MessageDescriptor для кода ошибки
 * После этого нужно будет запустить: npm run extract
 */
export function getErrorMessage(errorCode: string): MessageDescriptor {
  // LingUI извлечёт все эти msg() и добавит в каталог переводов
  
  // AUTH
  if (errorCode === 'auth.field_required') return msg`Поле обязательно для заполнения`;
  if (errorCode === 'auth.email_already_exists') return msg`Пользователь с таким email уже существует`;
  if (errorCode === 'auth.registration_success') return msg`Регистрация успешна! Пароль отправлен на ваш email.`;
  if (errorCode === 'auth.email_and_password_required') return msg`Email и пароль обязательны`;
  if (errorCode === 'auth.invalid_credentials') return msg`Неверный email или пароль`;
  if (errorCode === 'auth.login_error') return msg`Ошибка при входе`;
  if (errorCode === 'auth.registration_error') return msg`Ошибка при регистрации. Попробуйте еще раз.`;
  if (errorCode === 'auth.email_required') return msg`Email обязателен`;
  if (errorCode === 'auth.user_not_found') return msg`Пользователь с таким email не найден`;
  if (errorCode === 'auth.password_reset_success') return msg`Новый пароль отправлен на ваш email`;
  if (errorCode === 'auth.password_reset_error') return msg`Ошибка при восстановлении пароля`;
  if (errorCode === 'auth.email_send_failed') return msg`Ошибка отправки email. Попробуйте еще раз.`;

  // CANDIDATE
  if (errorCode === 'candidate.name_required') return msg`Имя обязательно`;
  if (errorCode === 'candidate.name_and_phone_required') return msg`Имя и телефон обязательны`;
  if (errorCode === 'candidate.created_title') return msg`Новый кандидат добавлен`;
  if (errorCode === 'candidate.resume_text_required') return msg`Текст резюме не предоставлен`;
  if (errorCode === 'candidate.resume_saved') return msg`Резюме успешно сохранено`;
  if (errorCode === 'candidate.not_from_headhunter') return msg`Кандидат не из HeadHunter.ru`;
  if (errorCode === 'candidate.no_hh_resume_info') return msg`Нет информации о резюме из HH`;
  if (errorCode === 'candidate.hh_resume_load_failed') return msg`Не удалось загрузить резюме из HH.ru`;
  if (errorCode === 'candidate.hh_resume_loaded') return msg`Резюме успешно загружено из HeadHunter.ru`;
  if (errorCode === 'candidate.hh_view_limit_exceeded') return msg`Превышен лимит просмотров резюме на HeadHunter.ru. Попробуйте позже.`;
  if (errorCode === 'candidate.hh_resume_load_error') return msg`Ошибка при загрузке резюме`;
  if (errorCode === 'candidate.status_required') return msg`Статус обязателен`;
  if (errorCode === 'candidate.invalid_status') return msg`Неверный статус`;
  if (errorCode === 'candidate.not_found') return msg`Кандидат не найден`;
  if (errorCode === 'candidate.wrong_vacancy') return msg`Кандидат не принадлежит этой вакансии`;
  if (errorCode === 'candidate.does_not_belong_to_vacancy') return msg`У кандидата нет вакансии`;
  if (errorCode === 'candidate.hh_token_required') return msg`Требуется авторизация HH.ru для загрузки резюме с HeadHunter`;
  if (errorCode === 'candidate.data_deletion_success') return msg`Все ваши данные успешно удалены с платформы`;
  if (errorCode === 'candidate.data_deletion_failed') return msg`Произошла ошибка при удалении данных. Обратитесь к нам через форму обратной связи.`;
  if (errorCode === 'candidate.invalid_ids_for_comparison') return msg`Неверные ID кандидатов для сравнения`;
  if (errorCode === 'candidate.no_candidates_found') return msg`Кандидаты не найдены`;

  // VACANCY
  if (errorCode === 'vacancy.unknown_creator') return msg`Неизвестно`;
  if (errorCode === 'vacancy.not_found') return msg`Вакансия не найдена`;

  // INTERVIEW
  if (errorCode === 'interview.not_started') return msg`Интервью ещё не начиналось`;
  if (errorCode === 'interview.finished') return msg`Интервью завершено`;
  if (errorCode === 'interview.processing_answers') return msg`Ваши ответы еще обрабатываются. Пожалуйста, подождите.`;
  if (errorCode === 'interview.results_not_ready') return msg`Обратная связь еще не сгенерирована. Используйте /request-results для запуска генерации.`;
  if (errorCode === 'interview.results_ready') return msg`Результаты готовы!`;
  if (errorCode === 'interview.generating_feedback') return msg`Генерируется обратная связь. Повторите запрос через несколько секунд.`;
  if (errorCode === 'interview.template_disabled') return msg`Интервью временно недоступно`;
  if (errorCode === 'interview.closed_by_company') return msg`Прохождение интервью закрыто компанией`;

  // REGULATION TEST
  if (errorCode === 'regulation_test.questions_generated') return msg`Вопросы успешно сгенерированы`;
  if (errorCode === 'regulation_test.invitation_not_found') return msg`Приглашение не найдено`;
  if (errorCode === 'regulation_test.invitation_expired') return msg`Приглашение истекло или уже использовано`;
  if (errorCode === 'regulation_test.insufficient_balance') return msg`У компании недостаточно тестов на балансе. Обратитесь к администратору.`;
  if (errorCode === 'regulation_test.billing_error') return msg`Не удалось списать тест с баланса.`;
  if (errorCode === 'regulation_test.session_not_found') return msg`Сессия не найдена`;
  if (errorCode === 'regulation_test.session_not_active') return msg`Сессия не активна`;
  if (errorCode === 'regulation_test.question_id_required') return msg`ID вопроса обязателен`;
  if (errorCode === 'regulation_test.question_not_found') return msg`Вопрос не найден`;
  if (errorCode === 'regulation_test.completed_title') return msg`Тест пройден`;

  // HH
  if (errorCode === 'hh.company_not_selected') return msg`Компания не выбрана`;
  if (errorCode === 'hh.vacancy_not_found') return msg`Вакансия не найдена`;
  if (errorCode === 'hh.token_not_found') return msg`Токен HH.ru не найден`;
  if (errorCode === 'hh.token_not_active') return msg`Не найден активный токен HH.ru. Пожалуйста, переавторизуйтесь.`;
  if (errorCode === 'hh.token_expired_refreshing') return msg`Токен истёк. Попытка автоматического обновления...`;
  if (errorCode === 'hh.token_refreshed') return msg`Токен успешно обновлён`;
  if (errorCode === 'hh.token_refresh_failed') return msg`Не удалось обновить токен. Требуется повторная авторизация.`;
  if (errorCode === 'hh.token_invalid') return msg`Токен невалиден. Требуется повторная авторизация.`;
  if (errorCode === 'hh.integration_disabled') return msg`Интеграция была отключена. Данные сохранены, но новые обновления не поступают.`;
  if (errorCode === 'hh.integration_disconnected') return msg`Интеграция была отключена. Данные сохранены, но новые обновления не поступают.`;
  if (errorCode === 'hh.no_active_token') return msg`Не найден активный токен HH.ru. Пожалуйста, переавторизуйтесь.`;
  if (errorCode === 'hh.sync_settings_updated') return msg`Настройки синхронизации обновлены`;
  if (errorCode === 'hh.sync_settings_update_error') return msg`Ошибка при обновлении настроек`;
  if (errorCode === 'hh.vacancy_data_fetch_failed') return msg`Не удалось получить данные вакансии с HH.ru`;
  if (errorCode === 'hh.vacancy_updated') return msg`Вакансия обновлена`;
  if (errorCode === 'hh.vacancy_update_error') return msg`Ошибка при обновлении вакансии`;
  if (errorCode === 'hh.vacancies_synced') return msg`Синхронизация вакансий завершена`;
  if (errorCode === 'hh.responses_synced') return msg`Синхронизация откликов завершена`;
  if (errorCode === 'hh.vacancies_sync_completed') return msg`Синхронизация вакансий завершена`;
  if (errorCode === 'hh.candidates_sync_completed') return msg`Синхронизация откликов завершена`;
  if (errorCode === 'hh.status_check_error') return msg`Ошибка получения статуса интеграции`;
  if (errorCode === 'hh.token_status_check_error') return msg`Ошибка проверки статуса токена`;
  if (errorCode === 'hh.vacancy_info_error') return msg`Ошибка при получении информации о вакансии`;
  if (errorCode === 'hh.sync_error') return msg`Ошибка синхронизации`;
  if (errorCode === 'hh.vacancy_and_company_required') return msg`vacancy_id и company_id обязательны`;

  // BILLING
  if (errorCode === 'billing.company_not_found') return msg`Компания не найдена`;
  if (errorCode === 'billing.plan_code_required') return msg`Код тарифа обязателен`;
  if (errorCode === 'billing.plan_not_found') return msg`Тариф не найден`;
  if (errorCode === 'billing.free_plan_already_used') return msg`Бесплатный тариф доступен только один раз`;
  if (errorCode === 'billing.payment_not_found') return msg`Платёж не найден`;
  if (errorCode === 'billing.insufficient_balance') return msg`Интервью временно недоступно. Пожалуйста, свяжитесь с компанией для уточнения деталей.`;
  if (errorCode === 'billing.interview_blocked') return msg`Интервью заблокировано из-за недостаточного баланса`;

  // COMMON
  if (errorCode === 'common.not_found') return msg`Не найдено`;
  if (errorCode === 'common.unauthorized') return msg`Не авторизован`;
  if (errorCode === 'common.forbidden') return msg`Доступ запрещён`;
  if (errorCode === 'common.internal_error') return msg`Внутренняя ошибка сервера`;
  if (errorCode === 'common.resource_not_found') return msg`Ресурс не найден`;
  if (errorCode === 'common.template_not_found') return msg`Шаблон интервью не найден`;
  if (errorCode === 'common.company_not_found') return msg`Компания не найдена`;

  // CONSENT
  if (errorCode === 'consent.invalid_subject_type') return msg`Недопустимый тип субъекта`;

  // CONTACT
  if (errorCode === 'contact.fields_required') return msg`Все обязательные поля должны быть заполнены`;
  if (errorCode === 'contact.invalid_email') return msg`Некорректный email адрес`;

  // PRIVACY
  if (errorCode === 'privacy.email_and_name_required') return msg`Email и имя обязательны для заполнения`;

  // PAYMENT
  if (errorCode === 'payment.webhook_processing_failed') return msg`Ошибка обработки webhook платежа`;

  // NOTIFICATION
  if (errorCode === 'notification.candidate_added_title') return msg`Новый кандидат добавлен`;
  if (errorCode === 'notification.test_completed_title') return msg`Тест пройден`;

  // Fallback - если код не найден
  console.warn(`Translation not found for error code: ${errorCode}`);
  return msg`Произошла ошибка`;
}

/**
 * Для сообщений с параметрами используйте Trans компонент:
 * 
 * <Trans>
 *   Поле {params.field} обязательно для заполнения
 * </Trans>
 * 
 * или t макрос:
 * 
 * t`Поле ${params.field} обязательно для заполнения`
 */

