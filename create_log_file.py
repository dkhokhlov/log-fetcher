import os

def generate_log_file(file_path, target_size_in_bytes):
    with open(file_path, 'w') as file:
        current_size = 0
        line_number = 1
        while current_size < target_size_in_bytes:
            log_entry = f'Log Line {line_number}\n'
            file.write(log_entry)
            current_size += len(log_entry)
            line_number += 1

file_path = 'large_log_file.log'
one_gigabyte = 1024 * 1024 * 1024  # 1GB in bytes
generate_log_file(file_path, one_gigabyte)
