let c = 0;
const UserGroup = {
  Everyone:    1 << c++,
  Regulars:    1 << c++,
  Subscribers: 1 << c++,
  Moderators:  1 << c++,
  Broadcaster: 1 << c++
};

c = 0;
const StreamState = {
  Online:      1 << c++,
  Offline:     1 << c++,
  Submode:     1 << c++,
  NonSubmode:  1 << c++,

  All:        (1 << c++) - 1
};