// // components/Notifications.tsx
// import { Models } from 'appwrite';
// import { Link } from 'react-router-dom';
// import Loader from './Loader';
// import { useQueryClient } from '@tanstack/react-query';

// type NotificationProps = {
//   userId: string;
//   notifications: Models.DocumentList<Models.Document> | undefined;
//   isLoading: boolean;
// };

// const Notifications = ({ userId, notifications, isLoading }: NotificationProps) => {
//   const queryClient = useQueryClient();
//   const { mutate: markAsRead } = useMarkNotificationAsRead();

//   const handleNotificationClick = (notification: Models.Document) => {
//     if (!notification.isRead) {
//       markAsRead(notification.$id, {
//         onSuccess: () => {
//           queryClient.invalidateQueries(['notifications', userId]);
//         }
//       });
//     }
//   };

//   if (isLoading) return <Loader />;

//   const unreadCount = notifications?.documents?.filter(n => !n.isRead).length || 0;

//   return (
//     <div className="notification-dropdown p-4 bg-dark-2 rounded-lg shadow-lg w-80">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="h3-bold text-light-1">Notifications</h3>
//         {unreadCount > 0 && (
//           <span className="bg-primary-500 text-light-1 text-xs rounded-full px-2 py-1">
//             {unreadCount}
//           </span>
//         )}
//       </div>
      
//       {notifications?.documents?.length === 0 ? (
//         <p className="text-light-3">No notifications yet</p>
//       ) : (
//         <ul className="space-y-2 max-h-80 overflow-y-auto">
//           {notifications?.documents?.map((notification) => (
//             <li 
//               key={notification.$id}
//               className={`p-3 rounded-lg cursor-pointer transition ${
//                 notification.isRead ? 'bg-dark-3' : 'bg-dark-4'
//               }`}
//               onClick={() => handleNotificationClick(notification)}
//             >
//               <Link 
//                 to={getNotificationLink(notification)} 
//                 className="flex items-start gap-3"
//               >
//                 <img 
//                   src={notification.sender?.imageUrl || '/assets/icons/profile-placeholder.svg'} 
//                   alt="sender" 
//                   className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div className="flex-1">
//                   <p className="small-medium text-light-1">
//                     {getNotificationMessage(notification)}
//                   </p>
//                   <p className="subtle-semibold text-light-3 text-xs mt-1">
//                     {new Date(notification.timestamp).toLocaleString([], {
//                       month: 'short',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit'
//                     })}
//                   </p>
//                 </div>
//                 {!notification.isRead && (
//                   <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
//                 )}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// // Helper functions
// const getNotificationMessage = (notification: Models.Document) => {
//   switch (notification.type) {
//     case 'follow':
//       return `${notification.sender?.name} started following you`;
//     case 'like':
//       return `${notification.sender?.name} liked your post`;
//     default:
//       return 'New activity on your account';
//   }
// };

// const getNotificationLink = (notification: Models.Document) => {
//   switch (notification.type) {
//     case 'follow':
//       return `/profile/${notification.senderId}`;
//     case 'like':
//       return notification.postId ? `/posts/${notification.postId}` : '/';
//     default:
//       return '/';
//   }
// };

// export default Notifications;