import mock from './mock';
import './blog/blogData';
import './contacts/ContactsData';
import './chat/Chatdata';
import './notes/NotesData';
import './ticket/TicketData';
import './eCommerce/ProductsData';
import './eCommerce/ProductsDatav2';
import './email/EmailData';
import './userprofile/PostData';
import './userprofile/PostData2';
import './userprofile/UsersData';
import './dashboard/LatestReviewsData';

mock.onAny().passThrough();
