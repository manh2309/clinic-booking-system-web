# ClinicBooking

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Trên nhánh `codex/local-dev`, khởi động backend Spring Boot ở cổng 9000 rồi chạy `npm start` trong thư mục Web. Mở `http://localhost:4200/`. Web gọi `http://localhost:9000/api/v1` và tự tải lại khi sửa mã.

Để xem lỗi API, mở DevTools → Network, thực hiện lại thao tác và xem mã HTTP cùng phần Response. Đối chiếu với log của backend đang chạy trên máy.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Trên nhánh này, `npm run build` mặc định dùng API local. Có thể kiểm tra cấu hình triển khai bằng `npm run build -- --configuration production`. Lệnh này dùng API Render, giống cấu hình build của `main`. Kết quả build nằm trong `dist/`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
